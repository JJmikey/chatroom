<script lang="ts">
  import { showList } from "../stores/ui";
</script>

<div class="app-shell" class:mode-list={$showList} class:mode-chat={!$showList}>
  <div class="sidebar-area">
    <slot name="sidebar" />
  </div>

  <div class="main-area">
    <slot name="main" />
  </div>
</div>

<style>
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

  @media (max-width: 600px) {
    .app-shell.mode-list .sidebar-area {
      display: block;
      width: 100%;
    }
    .app-shell.mode-list .main-area {
      display: none;
    }

    .app-shell.mode-chat .sidebar-area {
      display: none;
    }
    .app-shell.mode-chat .main-area {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
</style>
