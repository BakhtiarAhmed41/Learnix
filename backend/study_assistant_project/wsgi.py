"""
WSGI config for study_assistant_project project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'study_assistant_project.settings')

application = get_wsgi_application() 