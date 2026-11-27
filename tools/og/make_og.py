"""Make the share images (Open Graph cards, 1200×630) in site/assets/og/.

Needs: playwright with Chromium, the site served locally (python3 -m http.server 8771 in site/),
and the fonts from npm (@fontsource/fraunces, inter, jetbrains-mono) in OG_FONTS.
    python3 tools/og/make_og.py [--base http://127.0.0.1:8771] [name ...]
Each card shows a still from a live exhibit of the Lab gallery.
"""
import json, os, sys, urllib.parse
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'site/assets/og')
FONTS = os.environ.get('OG_FONTS', '/tmp/og/node_modules/@fontsource')
args = sys.argv[1:]
BASE = 'http://127.0.0.1:8771'
if '--base' in args:
    i = args.index('--base'); BASE = args[i + 1]; del args[i:i + 2]

# name: (kicker, title, subtitle, footer, exhibit, parameters)
CARDS = {
    'home':      ('Visva-Bharati · Mathematics', 'Question papers, typed and searchable', 'B.Sc. and M.Sc. papers from 2016 to 2026, written in LaTeX and linked to the original scans.', '7,700+ questions', 'portrait', {'n': 60}),
    'papers':    ('Question papers', 'Every paper, by semester and year', 'B.Sc. Semesters I–VIII and M.Sc. Semesters I–IV, each paper typed with its original scan.', '450+ papers', 'roots', {'n': 8}),
    'search':    ('Search', 'Find any question in seconds', 'Search by words, topic, semester, year, paper code or marks. Spelling slips are forgiven.', '7,700+ questions', 'newton', {}),
    'topics':    ('Topics and trends', 'What gets asked, year by year', 'How often each area of mathematics appears in Visva-Bharati papers.', 'Topics and trends', 'logistic', {}),
    'scans':     ('Original scans', 'The papers as they were printed', 'Scanned Visva-Bharati mathematics question papers from 2004 onwards.', 'Scanned papers', 'sierpinski', {}),
    'exams':     ('Competitive exams', 'JAM, NET, GATE, NBHM and TIFR', 'Previous papers for the national examinations, typed and searchable alongside the university papers.', 'Competitive papers', 'rocket', {}),
    'syllabus':  ('Syllabus', 'What each semester covers', 'B.Sc. and M.Sc. Mathematics syllabi: NEP 2025, CBCS 2020 and 2017; NET and JAM syllabi.', 'Syllabi', 'bezier', {}),
    'notes':     ('Notes', 'Class notes from former students', 'Notes from the Department of Mathematics, Visva-Bharati, shared to help everyone revise.', 'Class notes', 'eddy', {}),
    'learn':     ('Books and videos', 'Where to read and watch next', 'Recommended textbooks, video courses and useful websites for mathematics students.', 'Resources', 'spiro', {'k': 7, 'd': .6}),
    'people':    ('People', 'Department of Mathematics', 'Faculty of the Department of Mathematics, Visva-Bharati, Santiniketan.', 'People', 'epicycloid', {'k': 5}),
    'guides':    ('Guides', 'Guides for students', 'Scholarships, admission, reaching Santiniketan, LaTeX and Ph.D. thesis submission.', 'Guides', 'satellite', {}),
    'contribute':('Contribute', 'Help the archive grow', 'Send question papers, type questions, fix topic tags or share solutions.', 'Student-run', 'square', {'N': 7}),
    'about':     ('About', 'A student-run archive', 'VBMath collects Visva-Bharati mathematics question papers so that every student can find them.', 'About VBMath', 'pendulum', {}),
    'tools':     ('Tools', 'CLab and tools for mathematics', 'Write and run C in the browser, plus free tools for computing, LaTeX and research.', 'Tools', 'vanderpol', {'mu': 2}),
    'gallery':   ('VBMath Lab', 'Mathematics you can play with', 'Live simulations, each with its equation, a short explanation and controls to change it.', '25 live exhibits', 'clifford', {}),
    'maker':     ('Question Maker', 'Build a question paper', 'Collect questions, arrange them by drag and drop, set marks, and download an A4 paper or its LaTeX.', 'Question Maker', 'lissajous', {'a': 5, 'b': 4}),
}

# some exhibits need longer to draw their full shape
WAIT = {'portrait': 9000, 'lorenz': 9000, 'clifford': 4000, 'eddy': 7000, 'heat': 3000, 'logistic': 5000, 'spiro': 8000, 'epicycloid': 8000, 'satellite': 5000, 'rocket': 7000, 'vanderpol': 7000, 'pendulum': 9000}
os.makedirs(OUT, exist_ok=True)
template = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.html'), encoding='utf-8').read()
names = args or list(CARDS)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROME', '/usr/bin/google-chrome'))
    page = browser.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
    page.route('**/__og/card.html*', lambda r: r.fulfill(status=200, content_type='text/html', body=template))
    def font(route):
        name = route.request.url.rsplit('/', 1)[1]
        family = name.split('-latin')[0]
        route.fulfill(status=200, content_type='font/woff2', body=open(f'{FONTS}/{family}/files/{name}', 'rb').read())
    page.route('**/__fonts/*', font)
    for name in names:
        kicker, title, sub, foot, ex, par = CARDS[name]
        q = dict(kicker=kicker, title=title, sub=sub, foot=foot, ex=ex, par=par, wait=WAIT.get(ex, 3500))
        page.goto(BASE + '/__og/card.html?q=' + urllib.parse.quote(json.dumps(q)))
        page.wait_for_selector('body[data-ready="1"]', timeout=20000)
        page.screenshot(path=os.path.join(OUT, name + '.png'))
        print('made', name)
    browser.close()
