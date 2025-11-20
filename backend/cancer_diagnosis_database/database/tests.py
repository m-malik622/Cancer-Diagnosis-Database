from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
import json
#example unit test (type we will be doign for task #4)
'''
# Create your tests here.
class LoginSystemAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username="TestingAdmin",email="admin@example.com", password="testingdminpass")
        self.normal_user = User.objects.create_user(username="TestingUser", email="user@example.com", password="testinguserpass")
        #test data im creating
        self.testLogin = User.objects.create(
            username="django_lover6969",
            email="i_love_microplastics@microplastics.com",
            date_joined=timezone.now()
        )
        self.testLogin.set_password("django_be_like")
        self.testLogin.save()


    def test_valid_signin(self):
        self.url = reverse("login")
        response = self.client.post(self.url,{
            "username": "django_lover6969",
            "password": "django_be_like"
        })
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
  
    def test_invalid_signin(self):
        self.url = reverse("login")
        response = self.client.post(self.url,{
            "username": "i_love_microplastics@microplastics.com",
            "password": "django_be_like"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
  
    def invalid_signup(self):
        self.url = reverse("signup")
        #same everything
        response = self.client.post(self.url,{
            "username": "django_lover6969",
            "password": "django_be_like",
            "email": "i_love_microplastics@microplastics.com"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #existing username but diff email
        response = self.client.post(self.url,{
           "username": "django_lover6969",
            "password": "django_be_like",
            "email": "diffemail@fmil.com"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #existing email but diff usernmae
        response = self.client.post(self.url,{
                "username": "diff_username",
            "password": "django_be_like",
            "email": "i_love_microplastics@microplastics.com"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
'''