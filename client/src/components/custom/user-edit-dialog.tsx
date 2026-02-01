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
import { SquarePen, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useRef, useMemo, FC } from 'react'

import * as React from 'react'

import { User } from '@/types/chat'
import { userUpdateUserApi } from '@/api/userApi'
import { ChatRoom } from '@/types/chat'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

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
export const UserEditDialog: FC<{
  user: User
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  roomList: ChatRoom[]
}> = ({ user, setLoading, roomList }) => {
  const [userData, setUserData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  })
  const dialogCloseRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()

  const liveRoomList = useMemo(() => roomList.filter(room => room.isLive), [roomList])
  const notLiveRoomList = useMemo(() => roomList.filter(room => !room.isLive), [roomList])

  /**
   * fcEditUser 處理編輯用戶
   * @returns {void}
   */
  const fcEditUser = async () => {
    try {
      const res = await userUpdateUserApi(user.id, userData.name, userData.email)
      if (res.status === 200) {
        toast.success(t(res.code))
        setUserData({
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        })
        //關閉視窗
        dialogCloseRef.current?.click()
        //重新載入
        setLoading(true)
      } else {
        toast.error(t(res.code))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const [checkState, setCheckState] = useState<CheckedState>({
    allChecked: true,
    liveCheckedAll: true,
    notLiveCheckedAll: true,
    liveChecked: {},
    notLiveChecked: {},
  })
  /**
   * fcHandleCheckStateChange 處理勾選狀態
   * @param {string} field - 勾選的欄位
   * @param {boolean} checked - 勾選的狀態
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

  return (
    <Dialog>
      <DialogTrigger>
        <div className="mr-2">
          <SquarePen />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('user profile')}</DialogTitle>
          <DialogDescription>{t('adjust user details and permissions')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('name')}
            </Label>
            <Input
              id="name"
              onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
              defaultValue={userData.name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              {t('email')}
            </Label>
            <Input
              id="email"
              onChange={e => setUserData(prev => ({ ...prev, email: e.target.value }))}
              defaultValue={userData.email}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              {t('role')}
            </Label>
            <Input id="role" defaultValue={t(userData.role)} disabled className="col-span-3" />
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
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
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
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
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
            <Button onClick={fcEditUser} variant="default">
              {t('store')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
