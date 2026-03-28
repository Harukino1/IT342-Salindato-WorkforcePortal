package com.example.mobileapp.network

import com.example.mobileapp.network.model.AuthRequest
import com.example.mobileapp.network.model.AuthResponse
import com.example.mobileapp.network.model.UserRegistrationRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface ApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: UserRegistrationRequest): Response<Map<String, Any>>

    @POST("api/auth/logout")
    suspend fun logout(@Header("Authorization") token: String): Response<Map<String, Any>>
}