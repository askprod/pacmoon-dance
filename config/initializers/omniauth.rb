OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.silence_get_warning = true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter2,
    Rails.application.credentials.dig(:twitter, :client_key),
    Rails.application.credentials.dig(:twitter, :client_secret),
    callback_path: '/auth/twitter2/callback',
    scope: "tweet.read users.read follows.read offline.access",
    authorize_params: {
      force_login: 'false'
    }
end