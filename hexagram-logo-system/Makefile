PYTHON ?= python3
VENV_PYTHON = .venv/bin/python
VENV_PIP = .venv/bin/pip

.PHONY: setup svg showcase png contact-sheet trigrams-svg trigrams-png trigrams-showcase trigrams-sheet trigram-directions-svg trigram-directions-png trigram-directions-showcase trigram-taste-svg trigram-taste-png trigram-taste-showcase all

setup:
	$(PYTHON) -m venv .venv
	$(VENV_PIP) install -r requirements.txt

svg:
	$(PYTHON) scripts/generate_svg_logos.py

showcase:
	$(PYTHON) scripts/build_showcase.py

png:
	$(VENV_PYTHON) scripts/export_png_logos.py

contact-sheet:
	$(VENV_PYTHON) scripts/build_contact_sheet.py

trigrams-svg:
	$(PYTHON) scripts/generate_trigram_logos.py

trigrams-png:
	$(VENV_PYTHON) scripts/export_trigram_pngs.py

trigrams-showcase:
	$(PYTHON) scripts/build_trigram_showcase.py

trigrams-sheet:
	$(VENV_PYTHON) scripts/build_trigram_contact_sheet.py

trigram-directions-svg:
	$(PYTHON) scripts/generate_trigram_directions.py

trigram-directions-png:
	$(VENV_PYTHON) scripts/export_trigram_direction_pngs.py

trigram-directions-showcase:
	$(PYTHON) scripts/build_trigram_direction_showcase.py

trigram-taste-svg:
	$(PYTHON) scripts/generate_trigram_taste.py

trigram-taste-png:
	$(VENV_PYTHON) scripts/export_trigram_taste_pngs.py

trigram-taste-showcase:
	$(PYTHON) scripts/build_trigram_taste_showcase.py

all: svg showcase png contact-sheet trigrams-svg trigrams-png trigrams-showcase trigrams-sheet trigram-directions-svg trigram-directions-png trigram-directions-showcase trigram-taste-svg trigram-taste-png trigram-taste-showcase
