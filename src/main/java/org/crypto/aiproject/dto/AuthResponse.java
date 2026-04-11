package org.crypto.aiproject.dto;

public class AuthResponse {

    private boolean success;
    private String message;
    private String token;

    public AuthResponse(boolean success, String message, String token) {
        this.success = success;
        this.message = message;
        this.token = token;
    }

    public static AuthResponse ok(String message, String token) {
        return new AuthResponse(true, message, token);
    }

    public static AuthResponse error(String message) {
        return new AuthResponse(false, message, null);
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}

