"""Write the small statistics and daily-question data set used on the homepage."""
import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / 'site' / 'data'


def write_home_data(target, datasets, scans):
    # The headline numbers describe the Visva-Bharati archive (the first data set) only;
    # competitive and scholarship papers are counted separately.
    papers = datasets[0][0]
    years = [paper['year'] for paper in papers]
    extra_papers = sum(len(catalogue) for catalogue, _ in datasets[1:])
    eligible = []
    count = 0
    for catalogue, questions in datasets:
        for row in questions:
            if row[12]:
                continue
            if catalogue is datasets[0][0]:
                count += 1
            index, _, number, part, marks, marks_raw, tex = row[:7]
            if (marks is None or marks < 3 or not 60 < len(tex) < 520
                    or re.search(r'tabular|verbatim', tex)):
                continue
            paper = catalogue[index]
            eligible.append([
                {key: paper[key] for key in ('key', 'prog', 'sem', 'year', 'kind', 'code', 'title')},
                dict(qno=number, part=part, marks=marks, mraw=marks_raw, tex=tex, id=row[10]),
            ])
    size = min(48, len(eligible))
    home = dict(questions=count, papers=len(papers), scans=len(scans),
                years=[min(years), max(years)] if years else [],
                otherPapers=extra_papers,
                dailyQuestions=[eligible[i * len(eligible) // size] for i in range(size)])
    target.write_text(json.dumps(home, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')


if __name__ == '__main__':
    def read(name):
        return json.loads((DATA_DIR / f'{name}.json').read_text(encoding='utf-8'))

    datasets = [(read('papers')['papers'], read('questions'))]
    for name in ('competitive', 'scholarship'):
        dataset = read(name)
        datasets.append((dataset['papers'], dataset['questions']))
    write_home_data(DATA_DIR / 'home.json', datasets, read('scans'))
