import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { User } from '@/types/chat'
import { userDeleteUserApi } from '@/api/userApi'
import { useRef, FC } from 'react'
import * as React from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export const UserDeleteDialog: FC<{
  user: User
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ user, setLoading }) => {
  const dialogCloseRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()
  /**
   * fcDeleteUser 處理刪除用戶
   * @returns {void}
   */
  const fcDeleteUser = async (user: User) => {
    try {
      const res = await userDeleteUserApi(user.id, user.email)
      if (res.status === 200) {
        toast.success(t(res.code))
        setLoading(true)
        dialogCloseRef.current?.click()
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
          <Trash />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete user')}</DialogTitle>
          <DialogDescription>{t('are you sure you want to delete the user')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose ref={dialogCloseRef} asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </DialogClose>
          <Button variant="default" onClick={() => fcDeleteUser(user)}>
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
