<script lang="ts">
  import { showList } from "../stores/ui";
</script>

<!-- 
  根據 $showList 的狀態，動態加上 class
  mode-list: 手機顯示列表
  mode-chat: 手機顯示聊天室
-->
<div class="app-shell" class:mode-list={$showList} class:mode-chat={!$showList}>
  
  <!-- 左邊 Sidebar 插槽 -->
  <div class="sidebar-area">
    <slot name="sidebar" />
  </div>

  <!-- 右邊 Main 插槽 -->
  <div class="main-area">
    <slot name="main" />
  </div>

</div>

<style>
  /* === Desktop 預設佈局 === */
  .app-shell {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .sidebar-area {
    width: 280px;
    border-right: 1px solid #ddd;
    background: #fafafa;
    overflow-y: auto;
  }

  .main-area {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* === Mobile 邏輯 (關鍵在於狀態切換) === */
  @media (max-width: 600px) {
    
    /* 當處於 List 模式時 */
    .app-shell.mode-list .sidebar-area {
      display: block;
      width: 100%; /* 佔滿全屏 */
    }
    .app-shell.mode-list .main-area {
      display: none; /* 隱藏 ChatBox */
    }

    /* 當處於 Chat 模式時 */
    .app-shell.mode-chat .sidebar-area {
      display: none; /* 隱藏 List */
    }
    .app-shell.mode-chat .main-area {
      display: block;
      width: 100%; /* 佔滿全屏 */
      height: 100%;
    }
  }
</style>