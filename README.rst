pyenv-action
============

.. image:: https://github.com/gabrielfalcao/pyenv-action/workflows/Continuous%20Integration/badge.svg
   :target: https://github.com/gabrielfalcao/pyenv-action/actions

.. image:: https://img.shields.io/github/license/gabrielfalcao/pyenv-action?label=License
   :target: https://github.com/gabrielfalcao/pyenv-action/blob/master/LICENSE

.. image:: https://img.shields.io/github/v/tag/gabrielfalcao/pyenv-action?label=Latest%20Release
   :target: https://github.com/gabrielfalcao/pyenv-action/releases

This GitHub Action allows using pyenv in your build.

Features:
=========

- Installs pyenv ``2.3.0``.
- Exports `PYENV_ROOT <https://github.com/pyenv/pyenv#environment-variables>`_ environment variable.
- Injects ``$PYENV_ROOT/bin`` in the PATH.
- Injects `pyenv shims <https://github.com/pyenv/pyenv#understanding-shims>`_ in the PATH.
- Pre-install specified python versions.
- Set default python version (through ``pyenv local``).


**Note:** Supports Linux and MacOS (but not Windows).


Usage
=====


Example
-------

Installs python versions 3.6.8 and 3.7.5 with pyenv, upgrade pip for
each of them and run pytest.



.. code:: yaml

   name: Using
   on: [push, pull_request]

   jobs:
     my_python_job:
       name: "Python"
       runs-on: ubuntu-latest
       strategy:
         matrix:
           python:
             - 3.6.8
             - 3.7.5

       steps:
       - uses: actions/checkout@v2
       - name: Install python version
         uses: gabrielfalcao/pyenv-action@v9
         with:
           default: "${{ matrix.python }}"
           command: pip install -U pip  # upgrade pip after installing python

       - name: Install dependencies
         run: pip install -r requirements.txt

       - name: Run tests
         run: pytest .

Enable multiple python versions in your github-action
-----------------------------------------------------

.. code:: yaml

   name: Using python 3.7.5 with pyenv
   on: [push, pull_request]

   jobs:

     test_pyenv:
       runs-on: ubuntu-latest
       name: install pyenv
       steps:
       - name: setup pyenv
         uses: "gabrielfalcao/pyenv-action@v9"
         with:
           default: 3.7.2
           versions: 3.6.8, 3.5.7

       # create virtualenv for each python version

       - name: Create virtualenv for python 3.5.7
         run: pyenv local 3.5.7 && python3 -mvenv .venv357

       - name: Create virtualenv for python 3.6.8
         run: pyenv local 3.6.8 && python3 -mvenv .venv365

       - name: Create virtualenv for python 3.7.2
         run: pyenv local 3.7.2 && python3 -mvenv .venv372



Inputs
======


**default**
-----------


The default python version to install and set with ``pyenv local <version>``

Must be a valid python version supported by ``pyenv install <version>``


Example:


.. code:: yaml

   - name: setup pyenv
     uses: "gabrielfalcao/pyenv-action@v9"
     with:
         default: 3.7.5


**versions**
------------

A comma-separated list of versions that will be pre-installed in your
github action.


Each version must be a valid and supported by ``pyenv install <version>``

Example:


.. code:: yaml

   - name: setup pyenv
     uses: "gabrielfalcao/pyenv-action@v9"
     with:
         versions: 3.6.4, 3.7.2


**command**
-----------

A command that will be executed after installing each python version.

This is useful, for example, for pre-installing pip dependencies in each python.


Example:


.. code:: yaml

   - name: setup pyenv
     uses: "gabrielfalcao/pyenv-action@v9"
     with:
         versions: 3.6.4, 3.7.2
         command: |
           pip install -U pip setuptools
           pip install -r development.txt


Outputs
=======


**pyenv_root**
--------------


The full path to the `PYENV_ROOT
<https://github.com/pyenv/pyenv#environment-variables>`_


Example:


.. code:: yaml

   name: Example pyenv_root action output
   on: [push, pull_request]

   jobs:

     my_debug_job:
       runs-on: ubuntu-latest
       name: install pyenv
       steps:
       - name: setup pyenv
         id: pyenv_installation
         uses: "gabrielfalcao/pyenv-action@v9"

       - name: debug pyenv
         run: echo ${{ steps.pyenv_installation.outputs.pyenv_root }}
