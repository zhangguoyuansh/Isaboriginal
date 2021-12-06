from django.contrib import admin
from recognition_pic import models

####################系统相关配置######################
admin.site.site_header = 'recognize system'
admin.site.site_title = 'recognize system'
#####################################################


# Register your models here.

@admin.register(models.Recognize)
class UserInfoAdmin(admin.ModelAdmin):
    list_display = ('id', 'tagname','place', 'usefulness','stime')  # 展示的哪些字段？
    list_display_links = ('id',)  #
    search_fields = ('id', 'place')
    list_per_page = 50
    list_filter = ('id',)
    ordering = ('-id',)
