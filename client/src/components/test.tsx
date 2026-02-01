// import React from 'react'

// export const Test: React.FC = () => {
//   // 方法1: 使用 forEach (当前实现)
//   const statement = (s: string) => {
//     const stack: string[] = []
//     const mapObject: { [key: string]: string } = {
//       '(': ')',
//       '[': ']',
//       '{': '}',
//     }
//     const putInArray = ['(', '[', '{']
//     s.split('').forEach(item => {
//       if (putInArray.includes(item)) {
//         stack.push(item)
//       } else {
//         const lastItem = stack[stack.length - 1]
//         if (mapObject[lastItem] === item) {
//           stack.pop()
//         } else {
//           return false
//         }
//       }
//     })

//     return stack.length === 0
//   }

//   // 方法2: 使用 for...of 循环
//   const statement2 = (s: string): boolean => {
//     const stack: string[] = []
//     const mapObject: { [key: string]: string } = {
//       '(': ')',
//       '[': ']',
//       '{': '}',
//     }

//     for (const char of s) {
//       if (char in mapObject) {
//         stack.push(char)
//       } else {
//         const lastItem = stack.pop()
//         if (!lastItem || mapObject[lastItem] !== char) {
//           return false
//         }
//       }
//     }

//     return stack.length === 0
//   }

//   // 方法3: 使用 reduce
//   const statement3 = (s: string): boolean => {
//     const mapObject: { [key: string]: string } = {
//       '(': ')',
//       '[': ']',
//       '{': '}',
//     }

//     const stack = s.split('').reduce((acc: string[], char) => {
//       if (char in mapObject) {
//         acc.push(char)
//       } else {
//         const lastItem = acc[acc.length - 1]
//         if (lastItem && mapObject[lastItem] === char) {
//           acc.pop()
//         } else {
//           acc.push('INVALID') // 标记为无效
//         }
//       }
//       return acc
//     }, [])

//     return stack.length === 0
//   }

//   // 方法4: 使用 while 循环和索引
//   const statement4 = (s: string): boolean => {
//     const stack: string[] = []
//     const mapObject: { [key: string]: string } = {
//       '(': ')',
//       '[': ']',
//       '{': '}',
//     }

//     let i = 0
//     while (i < s.length) {
//       const char = s[i]
//       if (char in mapObject) {
//         stack.push(char)
//       } else {
//         if (stack.length === 0 || mapObject[stack.pop()!] !== char) {
//           return false
//         }
//       }
//       i++
//     }

//     return stack.length === 0
//   }

//   interface Node {
//     val: number
//     next: Node | null
//   }
//   const newNode = (val: number, next: Node | null) => {
//     return {
//       val,
//       next,
//     }
//   }
//   const arraytoList = (arr: number[]) => {
//     let head: Node | null = null
//     let tail: Node | null = null
//     for (let i = 0; i < arr.length; i++) {
//       let newNodes: Node = newNode(arr[i], null)
//       if (head === null) {
//         head = newNodes
//         tail = newNodes
//       } else {
//         tail!.next = newNodes
//         tail = newNodes
//       }
//     }
//     return head
//   }
//   const SinglyLinkedList = (head: Node | null) => {
//     let current: Node | null = head
//     let prev: Node | null = null
//     while (current !== null) {
//       let tempNext: Node | null = current.next
//       current.next = prev
//       prev = current
//       current = tempNext
//     }
//     return prev
//   }

//   cons ObjectToArray = (head: Node) => {
//     let current: Node | null = head
//     let result: number[] = []
//     while (current !== null) {
//       result.push(current.val)
//       current = current.next
//     }
//     return result
//   }
//   return <div>12345</div>
// }
