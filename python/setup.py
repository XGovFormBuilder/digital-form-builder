from setuptools import find_packages
from setuptools import setup

package_data = {"": ["*"]}

setup_kwargs = {
    "packages": find_packages(),
    "package_data": package_data,
}

setup(**setup_kwargs)
