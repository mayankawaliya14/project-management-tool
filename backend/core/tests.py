from django.test import TestCase, Client
from core.models import Organization, Project


class IsolationTests(TestCase):
    def setUp(self):
        self.org1 = Organization.objects.create(name='Org1', slug='org1', contact_email='o1@x.test')
        self.org2 = Organization.objects.create(name='Org2', slug='org2', contact_email='o2@x.test')
        Project.objects.create(organization=self.org1, name='P1', status='ACTIVE')
        Project.objects.create(organization=self.org2, name='P2', status='ACTIVE')
        self.client = Client()


    def test_org_isolation(self):
        q = '{ projects { name } }'
        res1 = self.client.post('/graphql/', data={'query': q}, HTTP_X_ORG_SLUG='org1')
        res2 = self.client.post('/graphql/', data={'query': q}, HTTP_X_ORG_SLUG='org2')
        self.assertContains(res1, 'P1')
        self.assertNotContains(res1, 'P2')
        self.assertContains(res2, 'P2')
        self.assertNotContains(res2, 'P1')