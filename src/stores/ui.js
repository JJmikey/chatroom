import { atom } from "nanostores";

// 預設改為 false (即係預設顯示 ChatBox)
export const showList = atom(false);

// 👇 新增：更新信號 (儲存一個數字，每次變動代表需要刷新)
export const refreshTrigger = atom(0);