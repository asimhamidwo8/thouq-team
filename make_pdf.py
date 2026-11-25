# يولّد cv/<slug>-cv.pdf من _cv/<slug>.html:  python3 make_pdf.py
import glob, os
from playwright.sync_api import sync_playwright
root = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(root, "cv"), exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for f in glob.glob(os.path.join(root, "_cv", "*.html")):
        slug = os.path.basename(f)[:-5]
        pg = b.new_page()
        pg.goto("file://" + f); pg.wait_for_timeout(800)
        pg.pdf(path=os.path.join(root, "cv", f"{slug}-cv.pdf"), format="A4", margin={"top":"11mm","bottom":"11mm","left":"12mm","right":"12mm"}, print_background=True)
        print("pdf:", slug)
    b.close()
