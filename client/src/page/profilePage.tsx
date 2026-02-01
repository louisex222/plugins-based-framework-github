import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { userUpdateUserProfileApi, userLogoutApi } from '@/api/userApi'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/zustand/userstore'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import girlImage from '@/assets/images/girl.jpeg'

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation()
  const userdata = JSON.parse(localStorage.getItem('userdata') || '{}')
  const [userData, setUserData] = useState({
    id: userdata.id,
    avatarUrl: userdata.avatarUrl,
    name: userdata.name,
    email: userdata.email,
    state: userdata.state,
    account: userdata.account,
    password: userdata.password,
    role: userdata.role,
  })
  const [previewUrl, setPreviewUrl] = useState<string>(userdata.avatarUrl || '')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { logout } = useUserStore()

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
   * fcSelectState 處理下拉選單變更
   * @param {string} value - 下拉選單值
   * @returns {void}
   */
  const fcSelectState = (value: string) => {
    setUserData(prev => ({
      ...prev,
      state: value,
    }))
  }
  /**
   * fcChangeShowPassword 處理密碼顯示切換
   * @returns {void}
   */
  const fcChangeShowPassword = () => {
    setShowPassword(!showPassword)
  }
  /**
   * fcUpdateUserProfile 更新使用者個人資料
   * @returns {void}
   */
  const fcUpdateUserProfile = async () => {
    const formData = new FormData()
    formData.append('id', userData.id)
    formData.append('account', userData.account)
    formData.append('password', userData.password)
    formData.append('name', userData.name)
    formData.append('email', userData.email)
    formData.append('state', userData.state)

    if (userFile) {
      formData.append('avatarUrl', userFile)
    }
    try {
      const res = await userUpdateUserProfileApi(formData)
      if (res.status === 200) {
        toast.success(t(res.code))
        await userLogoutApi(userData.id)
        logout()
        navigate('/login')
      } else {
        toast.error(t(res.code))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="text-xl font-bold">{t('edit personal profile')}</div>
      <form
        onSubmit={e => {
          e.preventDefault()
          fcUpdateUserProfile()
        }}
      >
        <div className="grid gap-4 grid-cols-1 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatarUrl" className="text-left col-span-1">
              {t('avatarurl')}
            </Label>
            <div className="flex items-center gap-4 col-span-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src={previewUrl ? previewUrl : girlImage} />
                <AvatarFallback>{userData.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input
                id="avatarUrl"
                onChange={fcHandleChangeFile}
                type="file"
                accept="image/*"
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account" className="text-left col-span-1">
              {t('account')}
            </Label>
            <Input
              id="account"
              onChange={fcHandleChange}
              value={userData.account}
              type="text"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-left col-span-1">
              {t('password')}
            </Label>
            <Input
              id="password"
              className="col-span-3"
              type={showPassword ? 'text' : 'password'}
              value={userData.password}
              onChange={fcHandleChange}
            />
            {showPassword ? (
              <Eye className="absolute right-5" onClick={fcChangeShowPassword} />
            ) : (
              <EyeOff className="absolute right-5" onClick={fcChangeShowPassword} />
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left col-span-1">
              {t('name')}
            </Label>
            <Input
              id="name"
              value={userData.name}
              onChange={fcHandleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-left col-span-1">
              {t('email')}
            </Label>
            <Input
              id="email"
              value={userData.email}
              onChange={fcHandleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-left col-span-1">
              {t('role')}
            </Label>
            <Input id="role" value={userData.role} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="createdAt" className="text-left col-span-1">
              {t('created at')}
            </Label>
            <Input
              id="createdAt"
              value={new Date().toISOString()}
              disabled
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isVerified" className="text-left col-span-1">
              {t('verified')}
            </Label>
            <Input id="isVerified" value="Yes" disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-left col-span-1">
              {t('state')}
            </Label>
            <Select value={userData.state} onValueChange={fcSelectState}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select state" />
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
          <div className="flex justify-end">
            <Button variant="default" type="submit">
              {t('store')}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}
