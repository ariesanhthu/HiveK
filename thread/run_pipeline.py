import argparse
import json
from pathlib import Path

from data_collecting import JSONLCollector, save_jsonl
from data_processing import TextProcessor, to_dict_list as processed_to_dict
from semantic_understanding import PhoBERTSemanticEngine, to_dict_list as semantic_to_dict
from evaluation import KOLEvaluator


def run(input_path: str, out_dir: str) -> None:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    print("[1/4] Data Collecting...")
    collector = JSONLCollector(input_path)
    raw_rows = collector.collect()

    print("[2/4] Data Processing...")
    processor = TextProcessor()
    processed_rows = processor.process(raw_rows)
    save_jsonl(processed_to_dict(processed_rows), str(out / "processed.jsonl"))

    print("[3/4] Semantic Understanding with PhoBERT...")
    semantic_engine = PhoBERTSemanticEngine(model_name="vinai/phobert-base")
    semantic_rows = semantic_engine.transform(processed_rows)
    save_jsonl(semantic_to_dict(semantic_rows), str(out / "semantic.jsonl"))

    print("[4/4] Evaluation...")
    evaluator = KOLEvaluator()
    evaluation_result = evaluator.evaluate(semantic_rows)

    save_jsonl(evaluation_result["records"], str(out / "evaluation_records.jsonl"))
    with (out / "evaluation_summary.json").open("w", encoding="utf-8") as f:
        json.dump(evaluation_result["summary"], f, ensure_ascii=False, indent=2)

    print("Done.")
    print(json.dumps(evaluation_result["summary"], ensure_ascii=False, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Social data pipeline for KOL evaluation")
    parser.add_argument("--input", default="threads_dataset.jsonl", help="Input JSONL dataset path")
    parser.add_argument("--out", default="pipeline_output", help="Output folder")
    args = parser.parse_args()

    run(args.input, args.out)


if __name__ == "__main__":
    main()
