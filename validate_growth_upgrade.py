import json
from pathlib import Path

root = Path(r"F:\ecommerce-erp-business-learning-pwa")


def load_json(name):
    return json.loads((root / name).read_text(encoding="utf-8-sig"))


learning_path = load_json("data/learning_path.json")
lessons = load_json("data/lessons.json")
cases = load_json("data/cases.json")
app_version = load_json("data/app_version.json")

assert len(learning_path) >= 8, "learning_path needs at least 8 stages"
assert len(lessons) >= 30, "lessons needs at least 30 records"
assert len(cases) >= 15, "cases needs at least 15 records"
assert app_version.get("version"), "app_version.version is required"

index = (root / "index.html").read_text(encoding="utf-8-sig")
app = (root / "app.js").read_text(encoding="utf-8-sig")
style = (root / "style.css").read_text(encoding="utf-8-sig")
service_worker = (root / "service-worker.js").read_text(encoding="utf-8-sig")
readme = (root / "README.md").read_text(encoding="utf-8-sig")
manifest = load_json("manifest.json")

for marker in ["growthCenter", "onlineCenter", "growthCenterContent", "onlineCenterContent"]:
    assert marker in index, marker

for marker in [
    "renderGrowthCenter",
    "renderDailyLearningTask",
    "renderKnowledgeMap",
    "renderLessons",
    "renderCases",
    "renderReviewCenter",
    "renderGrowthRecords",
    "generateChatGPTPrompt",
    "copyPromptToClipboard",
    "renderOnlineCenter",
    "mergeLearningProgress",
]:
    assert marker in app, marker

for marker in [".growth-layout", ".mastery-control", ".prompt-box", ".online-status-grid"]:
    assert marker in style, marker

for marker in ["./data/lessons.json", "./data/cases.json", "./data/app_version.json"]:
    assert marker in service_worker, marker

assert manifest.get("name") == "电商知识成长系统"
assert "2.0 电商知识成长系统" in readme

for forbidden in ["ghp_", "github_pat_"]:
    assert forbidden not in app
    assert forbidden not in readme

print("growth upgrade validation ok")

