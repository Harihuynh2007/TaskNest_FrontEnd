from django.urls import path
from .views import RegisterView, LoginView, ForgotPasswordView, ChangePasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
