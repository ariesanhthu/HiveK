# Social NLP Pipeline (PhoBERT)

Pipeline gom 4 pha:
1. Data Collecting
2. Data Processing
3. Semantic Understanding
4. Evaluation

## Input
- Mac dinh: `threads_dataset.jsonl`
- Moi dong la 1 JSON record

## Cai dat
```bash
pip install -r requirements.txt
```

## Chay pipeline
```bash
python run_pipeline.py --input threads_dataset.jsonl --out pipeline_output
```

## Output
- `pipeline_output/processed.jsonl`
- `pipeline_output/semantic.jsonl`
- `pipeline_output/evaluation_records.jsonl`
- `pipeline_output/evaluation_summary.json`

## KOL score
Cong thuc tong:

KOL Score =
  w1 * Sentiment Score
+ w2 * Engagement Quality
+ w3 * Topic Authority
+ w4 * (100 - Controversy Risk)

Trong do:
- Sentiment Score = (Positive - Negative) / Total * 100
- Risk Score =
  w1 * negative_ratio
+ w2 * toxicity_score
+ w3 * controversy_topic_ratio
