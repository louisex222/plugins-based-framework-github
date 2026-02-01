import React, { useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserEditDialog } from '@/components/custom/user-edit-dialog'
import { UserDeleteDialog } from '@/components/custom/user-delete-dialog'
import { UserAddDialog } from '@/components/custom/user-add-dialog'
import { userGetAllDataApi } from '@/api/userApi'
import { roomAllApi } from '@/api/chatroomApi'
import { User, ChatRoom, ApiResponse } from '@/types/chat'
import dayjs from 'dayjs'
import girlImage from '@/assets/images/girl.jpeg'
import { useTranslation } from 'react-i18next'

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const title = t('usersettings')
  const [usersData, setUsersData] = React.useState<User[]>([])
  const [roomList, setRoomList] = React.useState<ChatRoom[]>([])
  const [loading, setLoading] = React.useState(true)
  const isFetched = React.useRef(false)

  useEffect(() => {
    if (loading) {
      if (isFetched.current) {
        return
      }
      const fetchUsers = async () => {
        isFetched.current = true
        const data = await userGetAllDataApi()
        const roomData: ApiResponse<ChatRoom[]> = await roomAllApi()
        setRoomList(roomData.data)
        setUsersData(data.data)
        setLoading(false)
      }
      fetchUsers()
    } else {
      isFetched.current = false
    }
  }, [loading])

  return (
    <div>
      <div className="mt-6 flex justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <UserAddDialog setLoading={setLoading} roomList={roomList} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{t('avatarurl')}</TableHead>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('createdat')}</TableHead>
            <TableHead>{t('verified')}</TableHead>
            <TableHead>{t('state')}</TableHead>
            <TableHead>{t('options')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersData.map(user => (
            <TableRow key={user.name}>
              <TableCell className="flex items-center gap-x-2">
                <Avatar>
                  <AvatarImage src={user.avatarUrl ? user.avatarUrl : girlImage} alt={user.name} />
                  <AvatarFallback>{user.name}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                  {t(user.role)}
                </Badge>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
              <TableCell>
                <Badge variant={user.isVerified === true ? 'default' : 'outline'}>
                  {user.isVerified == true ? t('yes') : t('no')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.state === 'Online' ? 'default' : 'outline'}>
                  {t(user.state)}
                </Badge>
              </TableCell>
              <TableCell>
                <UserEditDialog user={user} setLoading={setLoading} roomList={roomList} />
                <UserDeleteDialog user={user} setLoading={setLoading} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
