local jwt = require "resty.jwt"

local jwt_secret = "your-secret_key-here"  -- use same as in backend
-- SECRET_KEY = "your-secret-key"  # Use env var in production
-- ALGORITHM = "HS256"  # HMAC-SHA256 - common algorithm for JWT

-- Get the Authorization header
local auth_header = ngx.var.http_Authorization
if not auth_header then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Missing Authorization header")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- Extract Bearer token
local _, _, token = string.find(auth_header, "Bearer%s+(.+)")
if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Malformed Authorization header")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- Verify JWT
local jwt_obj = jwt:verify(jwt_secret, token)
if not jwt_obj["verified"] then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Invalid token: ", jwt_obj.reason)
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
