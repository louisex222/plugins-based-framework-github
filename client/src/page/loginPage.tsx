import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/zustand/userstore'
import { Sun, Moon, Eye, EyeOff } from 'lucide-react'
import { useTheme } from '@/components/custom/theme-provider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { userLoginApi, userRegisterApi } from '@/api/userApi'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const LoginPage: React.FC = () => {
  const { setTheme } = useTheme()
  const [checked, setChecked] = useState(false)
  const navigate = useNavigate()
  const { login } = useUserStore()
  const [userData, setUserData] = useState({
    account: '',
    name: '',
    password: '',
    email: '',
    role: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [tabsData, setTabsData] = useState('login')
  const theme = localStorage.getItem('vite-ui-theme')
  const { t } = useTranslation()
  if (theme === null) {
    localStorage.setItem('vite-ui-theme', 'light')
  }
  /**
   * handleChange 處理輸入框變更
   * @param {React.ChangeEvent<HTMLInputElement>} e - 輸入框事件
   * @returns {void}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUserData(prev => ({
      ...prev,
      [id]: value,
    }))
  }
  /**
   * fcOnSubmitRegister 註冊表單提交
   * @param {React.FormEvent<HTMLFormElement>} e - 表單事件
   * @returns {void}
   */
  const fcOnSubmitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(userData)
    if (
      !userData.account ||
      !userData.password ||
      !userData.email ||
      !userData.name ||
      !userData.role
    ) {
      //請輸入完整資訊
      toast.error(t('code_1001'))
      return
    }
    //呼叫註冊API
    try {
      const res = await userRegisterApi(
        userData.account,
        userData.password,
        userData.email,
        userData.name,
        userData.role,
      )
      if (res.status === 200) {
        toast.success(t(res.code))
        fcOnSubmitLogin(e)
      } else {
        toast.error(t(res.code))
      }
    } catch (error) {
      //添加一個失敗註冊提醒
      console.error(error)
    }
  }
  /**
   * fcOnSubmitLogin 登入表單提交
   * @param {React.FormEvent<HTMLFormElement>} e - 表單事件
   * @returns {void}
   */
  const fcOnSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!userData.account || !userData.password) {
      //請輸入完整資訊
      toast.error(t('code_1001'))
      return
    }
    //呼叫登入API
    try {
      const res = await userLoginApi(userData.account, userData.password)
      if (res.status === 200) {
        localStorage.setItem('userdata', JSON.stringify(res.data))
        login()
        //添加一個成功登入提醒
        toast.success(t(res.code))
        setUserData({
          account: '',
          name: '',
          password: '',
          email: '',
          role: '',
        })
        navigate('/')
      } else {
        console.log(res.code)
        toast.error(t(res.code))
      }
    } catch (error) {
      //添加一個失敗登入提醒
      console.error(error)
    }
  }
  /**
   * fcChangeTheme 改變主題
   * @param {boolean} checked - 主題
   * @returns {void}
   */
  const fcChangeTheme = (checked: boolean) => {
    setChecked(checked)
    setTheme(checked ? 'dark' : 'light')
  }
  /**
   * fcChangeShowPassword 改變密碼顯示
   * @returns {void}
   */
  const fcChangeShowPassword = () => {
    setShowPassword(!showPassword)
  }
  /**
   * fcChangeTabsData 改變分頁
   * @param {string} value - 分頁
   * @returns {void}
   */
  const fcChangeTabsData = (value: string) => {
    setTabsData(value)
    clearUserData()
  }
  /**
   * clearUserData 清除使用者資料
   * @returns {void}
   */
  const clearUserData = () => {
    setUserData({
      account: '',
      name: '',
      password: '',
      email: '',
      role: '',
    })
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
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Tabs defaultValue={tabsData} className="w-[400px]" onValueChange={fcChangeTabsData}>
        <TabsList>
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
          <TabsTrigger value="register">{t('register')}</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form
            onSubmit={fcOnSubmitLogin}
            className="flex direction-column content-center justify-start w-[500px] border  flex-wrap p-5 rounded"
          >
            <div className="text-2xl font-bold mb-3">{t('login')}</div>
            <Input
              className="mb-5"
              type="text"
              placeholder={t('account')}
              id="account"
              onChange={handleChange}
            />
            <div className="flex items-center justify-center w-full relative mb-5">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                id="password"
                onChange={handleChange}
              />
              {showPassword ? (
                <Eye className="absolute right-2" onClick={fcChangeShowPassword} />
              ) : (
                <EyeOff className="absolute right-2" onClick={fcChangeShowPassword} />
              )}
            </div>
            <div className="flex items-center mb-4">
              <Switch checked={checked} onCheckedChange={fcChangeTheme} id="airplane-mode"></Switch>
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </div>
            <Button className="w-full" type="submit">
              {t('login')}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="register">
          <form
            onSubmit={fcOnSubmitRegister}
            className="flex direction-column content-center justify-start w-[500px] border flex-wrap p-5 rounded"
          >
            <div className="text-2xl font-bold mb-3">{t('register')}</div>
            <Input
              className="mb-5"
              type="text"
              placeholder={t('account')}
              id="account"
              onChange={handleChange}
            />
            <Input
              className="mb-5"
              type="text"
              placeholder={t('name')}
              id="name"
              onChange={handleChange}
            />
            <div className="flex items-center justify-center w-full relative mb-5">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                id="password"
                onChange={handleChange}
              />
              {showPassword ? (
                <Eye className="absolute right-2" onClick={fcChangeShowPassword} />
              ) : (
                <EyeOff className="absolute right-2" onClick={fcChangeShowPassword} />
              )}
            </div>
            <Input
              className="mb-5"
              type="email"
              placeholder={t('email')}
              id="email"
              onChange={handleChange}
            />

            <Select value={userData.role} onValueChange={fcSelectRole}>
              <SelectTrigger className="col-span-3 mb-5">
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

            <div className="flex items-center mb-4">
              <Switch checked={checked} onCheckedChange={fcChangeTheme} id="airplane-mode"></Switch>
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </div>
            <Button className="w-full" type="submit">
              {t('register')}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
