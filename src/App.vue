<template>
  <div class="text-white">
    <Toast ref="toastRef" />
    <CodonModal ref="codonModalRef" />

    <div class="codon-btn" @click="codonModalRef?.open()">密码子表</div>

    <div class="scroll-wrapper" ref="scrollWrapperRef" @scroll="handleScroll">
      <!-- 原始序列页面 -->
      <SlidePage
        title="原始序列"
        :hide-controls="false"
        @reset="() => handleReset('original')"
        @delete="() => handleDelete('original')"
      >
        <SequenceChain
          label="DNA 3'→5'"
          :items="sequences.original.dna"
          prefix="original"
          type="dna"
          :highlights="highlights.original.template"
          @select="(el, idx) => handleSelect('original', 'dna', el, idx)"
        />
        <SequenceChain
          label="DNA 5'→3'"
          :items="sequences.original.dnaCode"
          prefix="original"
          type="dna-code"
          :highlights="highlights.original.code"
          @select="(el, idx) => handleSelect('original', 'dna-code', el, idx)"
        />
        <div v-if="showMrna" class="chain">
          <BaseItem
            v-for="(base, idx) in sequences.original.mrna"
            :key="idx"
            :char="base"
            @click="(e) => handleSelect('original', 'mrna', e.target, idx)"
          />
        </div>
        <button
          v-if="!showMrna"
          class="btn"
          style="
            background: #64ffda;
            color: #000;
            margin: 1.5rem 0;
            width: 180px;
          "
          @click="showMrna = true"
        >
          开始
        </button>
        <SequenceChain
          label="多肽链"
          :items="sequences.original.protein"
          prefix="original"
          type="protein"
          is-amino
          :highlights="highlights.original.protein"
          @select="(el, idx) => handleSelect('original', 'protein', el, idx)"
        />
      </SlidePage>

      <!-- 碱基替换页面 -->
      <SlidePage
        title="碱基替换"
        show-undo
        @undo="() => handleUndo('replace')"
        @reset="() => handleReset('replace')"
        @delete="() => handleDelete('replace')"
      >
        <SequenceChain
          v-for="chain in getChains('replace')"
          :key="chain.type"
          :label="chain.label"
          :items="chain.items"
          :prefix="'replace'"
          :type="chain.type"
          :is-amino="chain.isAmino"
          :dropzone="true"
          :highlights="getHighlights('replace', chain.highlightKey)"
          @select="(el, idx) => handleSelect('replace', chain.type, el, idx)"
          @drop="(data) => handleDrop('replace', data)"
        />
      </SlidePage>

      <!-- 碱基增添页面 -->
      <SlidePage
        title="碱基增添"
        show-undo
        @undo="() => handleUndo('add')"
        @reset="() => handleReset('add')"
        @delete="() => handleDelete('add')"
      >
        <SequenceChain
          v-for="chain in getChains('add')"
          :key="chain.type"
          :label="chain.label"
          :items="chain.items"
          :prefix="'add'"
          :type="chain.type"
          :is-amino="chain.isAmino"
          :dropzone="true"
          :highlights="getHighlights('add', chain.highlightKey)"
          @select="(el, idx) => handleSelect('add', chain.type, el, idx)"
          @drop="(data) => handleDrop('add', data)"
        />
      </SlidePage>

      <!-- 碱基缺失页面 -->
      <SlidePage
        title="碱基缺失"
        show-undo
        @undo="() => handleUndo('del')"
        @reset="() => handleReset('del')"
        @delete="() => handleDelete('del')"
      >
        <SequenceChain
          v-for="chain in getChains('del')"
          :key="chain.type"
          :label="chain.label"
          :items="chain.items"
          :prefix="'del'"
          :type="chain.type"
          :is-amino="chain.isAmino"
          :dropzone="true"
          :highlights="getHighlights('del', chain.highlightKey)"
          @select="(el, idx) => handleSelect('del', chain.type, el, idx)"
          @drop="(data) => handleDrop('del', data)"
        />
      </SlidePage>

      <!-- 总结页面 -->
      <SlidePage title="序列整合总结" summary :hide-controls="true">
        <div v-for="section in summarySections" :key="section.key" class="mb-3">
          <p class="text-cyan-300 text-xs mb-1">{{ section.label }} → DNA</p>
          <SequenceChain
            :items="sequences[section.key].dna"
            :prefix="section.key"
            type="dna"
            summary
            :highlights="highlights[section.key].template"
          />
          <p class="text-cyan-300 text-xs mb-1">{{ section.label }} → 多肽链</p>
          <SequenceChain
            :items="sequences[section.key].protein"
            :prefix="section.key"
            type="protein"
            is-amino
            summary
            :highlights="highlights[section.key].protein"
          />
        </div>
      </SlidePage>
    </div>

    <Sidebar :visible="sidebarVisible" @drag-start="onDragStart" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import Toast from "./components/Toast.vue";
import CodonModal from "./components/CodonModal.vue";
import SlidePage from "./components/SlidePage.vue";
import SequenceChain from "./components/SequenceChain.vue";
import Sidebar from "./components/Sidebar.vue";
import BaseItem from "./components/BaseItem.vue";
import { useSequence } from "./composables/useSequence";
import { useHistory } from "./composables/useHistory";
import { useDragDrop } from "./composables/useDragDrop";

const toastRef = ref(null);
const codonModalRef = ref(null);
const scrollWrapperRef = ref(null);
const showMrna = ref(false);
const sidebarVisible = ref(true);

// 创建 toast 代理对象
const toastProxy = {
  show: (msg) => toastRef.value?.show(msg),
};

const sequenceOps = useSequence(toastProxy);
const dragDrop = useDragDrop(toastProxy);

// 将 sequenceOps 注入到 dragDrop
dragDrop.setSequenceOps(sequenceOps);

const {
  sequences,
  highlights,
  resetSequence,
  selectBase,
  deleteBase,
  getSnapshot,
  restoreSnapshot,
} = sequenceOps;
const { onDragStart, handleDrop: rawHandleDrop } = dragDrop;

// 历史记录
const histories = {
  replace: useHistory(),
  add: useHistory(),
  del: useHistory(),
};

// 链配置
const chainConfigs = [
  {
    label: "模板链（DNA 3'→5'）",
    type: "dna",
    itemsKey: "dna",
    highlightKey: "template",
  },
  {
    label: "编码链（DNA 5'→3'）",
    type: "dna-code",
    itemsKey: "dnaCode",
    highlightKey: "code",
  },
  { label: "mRNA", type: "mrna", itemsKey: "mrna", highlightKey: null },
  {
    label: "多肽链",
    type: "protein",
    itemsKey: "protein",
    isAmino: true,
    highlightKey: "protein",
  },
];

function getChains(prefix) {
  return chainConfigs.map((cfg) => ({
    ...cfg,
    items: sequences[prefix][cfg.itemsKey],
  }));
}

function getHighlights(prefix, key) {
  return key ? highlights[prefix][key] : new Set();
}

const summarySections = [
  { key: "original", label: "① 原始序列" },
  { key: "replace", label: "② 碱基替换" },
  { key: "add", label: "③ 碱基增添" },
  { key: "del", label: "④ 碱基缺失" },
];

function saveState(prefix) {
  const snapshot = getSnapshot(prefix);
  histories[prefix].push(snapshot);
}

function handleSelect(prefix, type, el, index) {
  selectBase(el, prefix, type, index);
}

function handleReset(prefix) {
  resetSequence(prefix);
  if (prefix !== "original") {
    saveState(prefix);
  }
}

function handleUndo(prefix) {
  const state = histories[prefix].undo();
  if (state) {
    restoreSnapshot(prefix, state);
  }
}

function handleDelete(prefix) {
  const selected = sequenceOps.selected.value;
  if (!selected.element || selected.prefix !== prefix) return;

  deleteBase(prefix, selected.type, selected.index);
  if (prefix !== "original") {
    saveState(prefix);
  }
}

function handleDrop(prefix, dropData) {
  const { type, data, index } = dropData;
  const success = rawHandleDrop(prefix, type, data, index);
  if (success && prefix !== "original") {
    // 延迟保存状态，确保序列已更新
    setTimeout(() => {
      saveState(prefix);
    }, 0);
  }
}

function handleScroll() {
  const wrapper = scrollWrapperRef.value;
  if (!wrapper) return;

  const pages = document.querySelectorAll(".slide-page");
  const scrollTop = wrapper.scrollTop;
  const pageHeight = wrapper.clientHeight;

  let currentPage = 0;
  pages.forEach((_, i) => {
    if (scrollTop >= i * pageHeight && scrollTop < (i + 1) * pageHeight) {
      currentPage = i;
    }
  });

  sidebarVisible.value = currentPage !== 4;
  const codonBtn = document.querySelector(".codon-btn");
  if (codonBtn) {
    codonBtn.style.right = currentPage === 4 ? "20px" : "280px";
  }

  const scrollWrapper = document.querySelector(".scroll-wrapper");
  if (scrollWrapper) {
    scrollWrapper.style.width =
      currentPage === 4 ? "100vw" : "calc(100vw - 280px)";
  }
}

onMounted(() => {
  // 初始化保存状态
  saveState("replace");
  saveState("add");
  saveState("del");
});

// 添加全局点击处理
function handleGlobalClick(e) {
  // 如果点击的不是 base 元素，清除所有高亮
  if (!e.target.classList.contains("base")) {
    sequenceOps.clearSelection();
  }
}

onMounted(() => {
  document.addEventListener("click", handleGlobalClick);
});
</script>

<style scoped>
.scroll-wrapper {
  transition: width 0.3s ease;
}
</style>
