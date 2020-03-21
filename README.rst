pyenv-action
============

This GitHub Action can build python projects with pyenv support

Usage
-----

To start checking all pull requests, add the following file at
``.github/workflows/pyenv.yml``:

.. code:: yaml

   name: Test My Application
   on: [pull_request]
   jobs:
     pyenv:
       runs-on: ubuntu-latest
       name: Check
       steps:
       - uses: actions/checkout@v1
       - name: Bento
         uses: gabrielfalcao/pyenv-action@v1
         with:
           pip_requirements:
           - "pip>=20.0.2"
           - "setuptools>=45.0.0"
           - "-r development.txt"

           commands:
             - nosetests --cover-erase tests/unit
             - nosetests tests/functional

           versions:
             - 3.6.4
             - 3.6.5
             - 3.7.3

Contributing
------------

See `CONTRIBUTING.md <CONTRIBUTING.md>`__
