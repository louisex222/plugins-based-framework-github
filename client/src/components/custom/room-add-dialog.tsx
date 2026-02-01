import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CirclePlus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useState, useRef, FC } from 'react'
import * as React from 'react'
import { Socket } from 'socket.io-client'

import { roomAddApi } from '@/api/chatroomApi'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import girlImage from '@/assets/images/girl.jpeg'
export const RoomAddDialog: FC<{ socket: Socket }> = ({ socket }) => {
  const { t } = useTranslation()
  const userData = JSON.parse(localStorage.getItem('userdata') || '{}')
  const [chatRoomData, setChatRoomData] = useState({
    name: userData.name,
    description: '',
    createdById: userData.id,
    slug: userData.account,
  })
  const [previewUrl, setPreviewUrl] = useState<string>(userData.avatarUrl || '')
  const dialogCloseRef = useRef<HTMLButtonElement>(null)
  /**
   * fcHandleChange 處理輸入框變更
   * @param {React.ChangeEvent<HTMLInputElement>} e - 輸入框變更事件
   * @returns {void}
   */
  const fcHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setChatRoomData(prev => ({
      ...prev,
      [id]: value,
    }))
  }
  const [userFile, setUserFile] = useState<File | null>(null)
  /**
   * fcHandleChangeFile 處理檔案變更
   * @param {React.ChangeEvent<HTMLInputElement>} e - 檔案變更事件
   * @returns {void}
   */
  const fcHandleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUserFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }
  /**
   * fcAddChatRoom 處理新增聊天室
   * @returns {void}
   */
  const fcAddChatRoom = async () => {
    const formData = new FormData()
    formData.append('name', chatRoomData.name)
    formData.append('description', chatRoomData.description)
    formData.append('createdById', chatRoomData.createdById)
    formData.append('slug', chatRoomData.slug)
    if (userFile) {
      formData.append('avatarUrl', userFile)
    }
    try {
      const res = await roomAddApi(formData)
      if (res.status === 200) {
        toast.success(t(res.code))
        socket.emit('offRoom')
        dialogCloseRef.current?.click()
        setChatRoomData({
          name: chatRoomData.name,
          description: '',
          createdById: chatRoomData.createdById,
          slug: chatRoomData.slug,
        })
      } else {
        toast.error(t(res.code))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="mr-2">
          <CirclePlus />
        </div>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={e => {
            e.preventDefault()
            fcAddChatRoom()
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('add a chat room.')}</DialogTitle>
            <DialogDescription>
              {t('please enter the relevant information for the chat room')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">
                {t('avatarurl')}
              </Label>
              <Avatar className="w-16 h-16 mb-4">
                <AvatarImage src={previewUrl ? previewUrl : girlImage} />
                <AvatarFallback>{userData.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input
                id="avatarUrl"
                onChange={fcHandleChangeFile}
                type="file"
                accept="image/*"
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="name"
                onChange={fcHandleChange}
                value={chatRoomData.name}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('description')}
              </Label>
              <Input
                id="description"
                onChange={fcHandleChange}
                value={chatRoomData.description}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                {t('slug')}
              </Label>
              <Input
                id="slug"
                disabled={true}
                onChange={fcHandleChange}
                value={chatRoomData.slug}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <DialogClose ref={dialogCloseRef} asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
              <Button variant="default" type="submit">
                {t('store')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
