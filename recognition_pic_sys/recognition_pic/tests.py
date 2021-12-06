from django.test import TestCase

# Create your tests here.
alist = [{'a':'aa','b':'bb'},{'a':'aaa','b':'bbb'}]
alist.remove({'a':'aa','b':'bb'})
print(str(alist))
