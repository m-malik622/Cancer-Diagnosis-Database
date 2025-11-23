# Register your models here.
from django.contrib import admin
from .models import *

#example
admin.site.register(Patient)
admin.site.register(Doctor)
admin.site.register(Cancer)
admin.site.register(Treatment)
admin.site.register(Evaluate)
admin.site.register(Diagnosis)
admin.site.register(Treat)