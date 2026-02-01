// 導入 clsx - 用於處理條件類名和各種輸入格式
// ClassValue 類型支援：字串、陣列、物件、undefined、null 等
import { type ClassValue, clsx } from 'clsx'

// 導入 tailwind-merge - 用於智能合併 Tailwind CSS 類名，解決衝突
import { twMerge } from 'tailwind-merge'

/**
 * cn (classNames) - shadcn/ui 的核心工具函數
 *
 * 功能：
 * 1. 處理條件類名（通過 clsx）
 * 2. 智能合併 Tailwind 類名，自動解決衝突（通過 twMerge）
 *
 * @param inputs - 可變參數，接受多種類型的類名輸入
 * @returns 合併後的類名字串
 *
 * 使用範例：
 * ```tsx
 * // 基本使用
 * cn("px-4 py-2", "bg-blue-500")
 * // 結果: "px-4 py-2 bg-blue-500"
 *
 * // 條件類名
 * cn("px-4", isActive && "bg-blue-500", !isActive && "bg-gray-500")
 * // 結果: "px-4 bg-blue-500" (如果 isActive 為 true)
 *
 * // 解決衝突（重點！）
 * cn("bg-red-500", "bg-blue-500")
 * // 結果: "bg-blue-500" (自動移除衝突的 bg-red-500)
 *
 * // 組件中使用
 * function Button({ className, variant }) {
 *   return (
 *     <button
 *       className={cn(
 *         "px-4 py-2",                          // 基礎樣式
 *         variant === "primary" && "bg-blue-500", // 條件樣式
 *         className                              // 用戶自定義（會覆蓋衝突）
 *       )}
 *     />
 *   )
 * }
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  // 執行流程：
  // 1. clsx(inputs) - 處理條件邏輯、陣列、物件等，輸出純字串
  // 2. twMerge(...) - 智能合併 Tailwind 類名，移除衝突
  return twMerge(clsx(inputs))
}
