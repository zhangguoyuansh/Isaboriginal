from django.db import models
import datetime

# Create your models here.

class Recognize(models.Model):
    id = models.AutoField(primary_key=True, auto_created=True, null=False, verbose_name='ID')
    tagname = models.CharField(max_length=200, verbose_name='tagname')
    place = models.CharField(max_length=200, verbose_name='place')
    usefulness = models.CharField(max_length=200, verbose_name='usefulness')
    stime = models.CharField(max_length=200,verbose_name='time')

    def __str__(self):
        return str(self.id)

    class Meta:
        managed = True
        db_table = 'recognize'
        verbose_name = 'recognize'
        verbose_name_plural = verbose_name
