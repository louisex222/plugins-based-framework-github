import service from './service'
import { ApiResponse, User } from '@/types/chat'

/**
 * 登入
 * @param account 帳號
 * @param password 密碼
 * @returns {Promise<any>}
 */
export const userLoginApi = async (
  account: string,
  password: string,
): Promise<ApiResponse<User>> => {
  const response = await service.post<ApiResponse<User>>('/login', {
    account,
    password,
  })
  return response.data as ApiResponse<User>
}

/**
 * 註冊
 * @param account 帳號
 * @param password 密碼
 * @param email 信箱
 * @param name 名字
 * @returns {Promise<any>}
 */
export const userRegisterApi = async (
  account: string,
  password: string,
  email: string,
  name: string,
  role: string,
): Promise<ApiResponse<User>> => {
  const response = await service.post<ApiResponse<User>>('/register', {
    account,
    password,
    email,
    name,
    role,
  })
  return response.data as ApiResponse<User>
}

/**
 * 登出
 * @param id 使用者id
 * @returns {Promise<any>}
 */
export const userLogoutApi = async (id: string): Promise<ApiResponse<null>> => {
  const response = await service.post<ApiResponse<null>>('/logout', { id })
  return response.data as ApiResponse<null>
}

/**
 * 取得所有使用者
 * @returns {Promise<any>}
 */
export const userGetAllDataApi = async (): Promise<ApiResponse<User[]>> => {
  const response = await service.get<ApiResponse<User[]>>('/allusers')
  return response.data as ApiResponse<User[]>
}

/**
 * 更新使用者
 * @param id 使用者id
 * @param name 名字
 * @param email 信箱
 * @returns {Promise<any>}
 */
export const userUpdateUserApi = async (
  id: string,
  name: string,
  email: string,
): Promise<ApiResponse<User>> => {
  const response = await service.put<ApiResponse<User>>('/updateuser', {
    id,
    name,
    email,
  })
  return response.data as ApiResponse<User>
}

/**
 * 刪除使用者
 * @param id 使用者id
 * @param email 信箱
 * @returns {Promise<any>}
 */
export const userDeleteUserApi = async (id: string, email: string): Promise<ApiResponse<null>> => {
  const response = await service.del<ApiResponse<null>>('/deleteuser', {
    id,
    email,
  })
  return response.data as ApiResponse<null>
}

/**
 * 新增使用者
 * @param formData 表單資料
 * @returns {Promise<any>}
 */
export const userAddUserApi = async (formData: FormData): Promise<ApiResponse<User>> => {
  const response = await service.post<ApiResponse<User>>('/adduser', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data as ApiResponse<User>
}

/**
 * 更新使用者狀態
 * @param id 使用者id
 * @param state 狀態
 * @returns {Promise<any>}
 */
export const userUpdateStateApi = async (id: string, state: string): Promise<ApiResponse<User>> => {
  const response = await service.put<ApiResponse<User>>('/updatestate', {
    id,
    state,
  })
  return response.data as ApiResponse<User>
}

/**
 * 取得線上使用者數量
 * @returns {Promise<any>}
 */
export const userOnlineCountApi = async (): Promise<ApiResponse<number>> => {
  const response = await service.get<ApiResponse<number>>('/online-count')
  return response.data as ApiResponse<number>
}

/**
 * 更新使用者個人資料
 * @param formData 表單資料
 * @returns {Promise<any>}
 */
export const userUpdateUserProfileApi = async (formData: FormData): Promise<ApiResponse<User>> => {
  const response = await service.put<ApiResponse<User>>('/updateuserprofile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data as ApiResponse<User>
}
