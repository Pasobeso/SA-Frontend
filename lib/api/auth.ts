import { client } from "./client";
import { USERS_URL } from "./microservices";
import { ApiResponse } from "./models";
import { Users } from "./users";

export namespace Auth {
  export interface LoginModel {
    hospital_number: number;
    password: String;
  }

  export interface Claims {
    sub: string;
    role: string;
    exp: number;
    iat: number;
  }

  export async function loginPatient(loginModel: LoginModel) {
    const res = await client.post(
      `${USERS_URL}/authentication/patients/login`,
      loginModel
    );
    return res.data as ApiResponse<null>;
  }

  export async function loginDoctor(loginModel: LoginModel) {
    const res = await client.post(
      `${USERS_URL}/authentication/doctors/login`,
      loginModel
    );
    return res.data as ApiResponse<null>;
  }

  export async function logout() {
    const res = await client.delete(`/${USERS_URL}/authentication/logout`);
    return res.data as ApiResponse<null>;
  }

  export async function refreshPatient() {
    const res = await client.post(
      `/${USERS_URL}/authentication/patients/refresh-token`
    );
    return res.data as ApiResponse<null>;
  }

  export async function refreshDoctor() {
    const res = await client.post(
      `/${USERS_URL}/authentication/doctors/refresh-token`
    );
    return res.data as ApiResponse<null>;
  }

  export interface GetMeResponseModel {
    claims: Claims;
    me: Users.UserEntity;
  }

  export async function getMe() {
    const res = await client.get(`/${USERS_URL}/authentication/me`);
    return res.data as ApiResponse<GetMeResponseModel>;
  }
}
