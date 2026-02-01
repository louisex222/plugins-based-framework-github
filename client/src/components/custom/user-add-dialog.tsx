import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CirclePlus, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useRef, useMemo, FC } from 'react'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { userAddUserApi } from '@/api/userApi'
import { ChatRoom } from '@/types/chat'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CheckedState {
  allChecked: boolean
  liveCheckedAll: boolean
  notLiveCheckedAll: boolean
  liveChecked: {
    [key: string]: boolean
  }
  notLiveChecked: {
    [key: string]: boolean
  }
}
export const UserAddDialog: FC<{
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  roomList: ChatRoom[]
}> = ({ setLoading, roomList }) => {
  const [userData, setUserData] = useState({
    avatarUrl: '',
    name: '',
    email: '',
    state: '',
    role: '',
  })

  const { t } = useTranslation()

  const liveRoomList = useMemo(() => roomList.filter(room => room.isLive), [roomList])
  const notLiveRoomList = useMemo(() => roomList.filter(room => !room.isLive), [roomList])

  const [checkState, setCheckState] = useState<CheckedState>({
    allChecked: true,
    liveCheckedAll: true,
    notLiveCheckedAll: true,
    liveChecked: {},
    notLiveChecked: {},
  })

  const [prevRoomList, setPrevRoomList] = useState(roomList)
  if (roomList !== prevRoomList) {
    setPrevRoomList(roomList)
    if (roomList.length > 0) {
      const liveChecked = liveRoomList.reduce(
        (acc, room) => {
          acc[room.slug] = true
          return acc
        },
        {} as { [key: string]: boolean },
      )

      const notLiveChecked = notLiveRoomList.reduce(
        (acc, room) => {
          acc[room.slug] = true
          return acc
        },
        {} as { [key: string]: boolean },
      )

      setCheckState({
        allChecked: true,
        liveCheckedAll: true,
        notLiveCheckedAll: true,
        liveChecked,
        notLiveChecked,
      })
    }
  }

  const [previewUrl, setPreviewUrl] = useState<string>(userData.avatarUrl || '')

  const dialogCloseRef = useRef<HTMLButtonElement>(null)
  /**
   * fcHandleChange 處理輸入框變更
   * @param {React.ChangeEvent<HTMLInputElement>} e - 輸入框事件
   * @returns {void}
   */
  const fcHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUserData(prev => ({
      ...prev,
      [id]: value,
    }))
  }
  const [userFile, setUserFile] = useState<File | null>(null)
  /**
   * fcHandleChangeFile 處理檔案變更
   * @param {React.ChangeEvent<HTMLInputElement>} e - 檔案事件
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
   * fcSelectState 處理狀態變更
   * @param {string} value - 狀態值
   * @returns {void}
   */
  const fcSelectState = (value: string) => {
    setUserData(prev => ({
      ...prev,
      state: value,
    }))
  }
  /**
   * fcSelectRole 處理角色變更
   * @param {string} value - 角色值
   * @returns {void}
   */
  const fcSelectRole = (value: string) => {
    setUserData(prev => ({
      ...prev,
      role: value,
    }))
  }
  /**
   * fcaddUser 處理新增用戶
   * @returns {void}
   */
  const fcaddUser = async () => {
    const formData = new FormData()
    formData.append('name', userData.name)
    formData.append('email', userData.email)
    formData.append('state', userData.state)
    formData.append('role', userData.role)

    if (userFile) {
      formData.append('avatarUrl', userFile)
    }
    try {
      const res = await userAddUserApi(formData)
      if (res.status === 200) {
        toast.success(t(res.code))
        dialogCloseRef.current?.click()
        setLoading(true)
      } else {
        toast.error(t(res.code))
      }
    } catch (error) {
      console.error(error)
    }
  }
  /**
   * fcHandleCheckStateChange 處理勾選狀態變更
   * @param {string} field - 勾選欄位
   * @param {boolean} checked - 勾選狀態
   * @returns {void}
   */
  const fcHandleCheckStateChange = (field: string) => (checked: boolean) => {
    setCheckState(prev => {
      const newState = { ...prev }
      if (field === 'allChecked') {
        newState.allChecked = checked
        newState.liveCheckedAll = checked
        newState.notLiveCheckedAll = checked
        newState.liveChecked = Object.keys(prev.liveChecked).reduce(
          (acc, key) => {
            acc[key] = checked
            return acc
          },
          {} as { [key: string]: boolean },
        )

        newState.notLiveChecked = Object.keys(prev.notLiveChecked).reduce(
          (acc, key) => {
            acc[key] = checked
            return acc
          },
          {} as { [key: string]: boolean },
        )
      } else if (field === 'liveCheckedAll') {
        newState.liveCheckedAll = checked
        newState.liveChecked = Object.keys(prev.liveChecked).reduce(
          (acc, key) => {
            acc[key] = checked
            return acc
          },
          {} as { [key: string]: boolean },
        )

        newState.allChecked = newState.liveCheckedAll && newState.notLiveCheckedAll
      } else if (field === 'notLiveCheckedAll') {
        newState.notLiveCheckedAll = checked
        newState.notLiveChecked = Object.keys(prev.notLiveChecked).reduce(
          (acc, key) => {
            acc[key] = checked
            return acc
          },
          {} as { [key: string]: boolean },
        )

        newState.allChecked = newState.liveCheckedAll && newState.notLiveCheckedAll
      } else {
        // 個別 room 的處理
        const isLive = field in prev.liveChecked
        if (isLive) {
          newState.liveChecked = { ...prev.liveChecked, [field]: checked }
          newState.liveCheckedAll = Object.values(newState.liveChecked).every(v => v)
        } else {
          newState.notLiveChecked = { ...prev.notLiveChecked, [field]: checked }
          newState.notLiveCheckedAll = Object.values(newState.notLiveChecked).every(v => v)
        }
        newState.allChecked = newState.liveCheckedAll && newState.notLiveCheckedAll
      }

      return newState
    })
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
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('user profile')}</DialogTitle>
            <DialogDescription>{t('adjust user details and permissions')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">
                {t('avatarurl')}
              </Label>
              {previewUrl ? (
                <div className="col-span-3">
                  <Avatar className="w-16 h-16 mb-4">
                    <AvatarImage src={previewUrl} />
                    <AvatarFallback>{userData.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Input
                    id="avatarUrl"
                    onChange={fcHandleChangeFile}
                    type="file"
                    accept="image/*"
                  />
                </div>
              ) : (
                <Input
                  id="avatarUrl"
                  onChange={fcHandleChangeFile}
                  type="file"
                  accept="image/*"
                  className="col-span-3"
                />
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}
              </Label>
              <Input id="name" onChange={fcHandleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('email')}
              </Label>
              <Input id="email" onChange={fcHandleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                {t('role')}
              </Label>
              <Select value={userData.role} onValueChange={fcSelectRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectrole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('role')}</SelectLabel>
                    <SelectItem value="admin">{t('admin')}</SelectItem>
                    <SelectItem value="user">{t('user')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createdAt" className="text-right">
                {t('createdat')}
              </Label>
              <Input
                id="createdAt"
                value={new Date().toISOString()}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isVerified" className="text-right">
                {t('verified')}
              </Label>
              <Input id="isVerified" value={t('yes')} disabled className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t('state')}
              </Label>
              <Select value={userData.state} onValueChange={fcSelectState}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectstate')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('state')}</SelectLabel>
                    <SelectItem value="online">{t('online')}</SelectItem>
                    <SelectItem value="offline">{t('offline')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t('rooms')}</Label>
              <div className="min-h-[100px] col-span-3 border border-border rounded-md p-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted cursor-pointer">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Checkbox
                          disabled={true}
                          checked={checkState.allChecked}
                          onCheckedChange={checked =>
                            fcHandleCheckStateChange('allChecked')(!!checked)
                          }
                        />
                        <span>{t('all chat rooms')}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      <Badge variant="secondary">2</Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 ml-6 space-y-1 border-l pl-3">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <div className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted cursor-pointer">
                          <div
                            className="flex items-center gap-2"
                            onClick={e => e.stopPropagation()}
                          >
                            <Checkbox
                              disabled={true}
                              checked={checkState.liveCheckedAll}
                              onCheckedChange={checked =>
                                fcHandleCheckStateChange('liveCheckedAll')(!!checked)
                              }
                            />
                            <span>{t('live chat rooms')}</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                          <Badge variant="outline">{liveRoomList.length}</Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1 ml-6 space-y-1 border-l pl-3">
                        {liveRoomList.map(room => (
                          <div
                            key={room.slug}
                            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                disabled={true}
                                checked={checkState.liveChecked[room.slug]}
                                onCheckedChange={checked =>
                                  fcHandleCheckStateChange(room.slug)(!!checked)
                                }
                              />
                              <span>{room.slug}</span>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <div className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted cursor-pointer">
                          <div
                            className="flex items-center gap-2"
                            onClick={e => e.stopPropagation()}
                          >
                            <Checkbox
                              disabled={true}
                              checked={checkState.notLiveCheckedAll}
                              onCheckedChange={checked =>
                                fcHandleCheckStateChange('notLiveCheckedAll')(!!checked)
                              }
                            />
                            <span>{t('off chat rooms')}</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                          <Badge variant="outline">{notLiveRoomList.length}</Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1 ml-6 space-y-1 border-l pl-3">
                        {notLiveRoomList.map(room => (
                          <div
                            key={room.slug}
                            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                disabled={true}
                                checked={checkState.notLiveChecked[room.slug]}
                                onCheckedChange={checked =>
                                  fcHandleCheckStateChange(room.slug)(!!checked)
                                }
                              />
                              <span>{room.slug}</span>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <DialogClose ref={dialogCloseRef} asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
              <Button onClick={fcaddUser} variant="default" type="submit">
                {t('store')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
