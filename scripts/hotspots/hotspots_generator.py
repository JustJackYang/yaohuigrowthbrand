import feedparser
import json
import os
import time
from datetime import datetime
from jinja2 import Template

# Default Configuration
DEFAULT_CONFIG = {
  "site_title": "2025年精选技术博客热点",
  "feeds": [
    {"name": "simonwillison.net", "url": "https://simonwillison.net/atom/everything/"},
    {"name": "jeffgeerling.com", "url": "https://www.jeffgeerling.com/blog.xml"},
    {"name": "seangoedecke.com", "url": "https://www.seangoedecke.com/rss.xml"},
    {"name": "krebsonsecurity.com", "url": "https://krebsonsecurity.com/feed/"},
    {"name": "daringfireball.net", "url": "https://daringfireball.net/feeds/main"},
    {"name": "ericmigi.com", "url": "https://ericmigi.com/rss.xml"},
    {"name": "antirez.com", "url": "http://antirez.com/rss"},
    {"name": "idiallo.com", "url": "https://idiallo.com/feed.rss"},
    {"name": "maurycyz.com", "url": "https://maurycyz.com/index.xml"},
    {"name": "pluralistic.net", "url": "https://pluralistic.net/feed/"},
    {"name": "shkspr.mobi", "url": "https://shkspr.mobi/blog/feed/"},
    {"name": "mitchellh.com", "url": "https://mitchellh.com/feed.xml"},
    {"name": "dynomight.net", "url": "https://dynomight.net/feed.xml"},
    {"name": "utcc.utoronto.ca/~cks", "url": "https://utcc.utoronto.ca/~cks/space/blog/?atom"},
    {"name": "xeiaso.net", "url": "https://xeiaso.net/blog.rss"},
    {"name": "devblogs.microsoft.com/oldnewthing", "url": "https://devblogs.microsoft.com/oldnewthing/feed"},
    {"name": "righto.com", "url": "https://www.righto.com/feeds/posts/default"},
    {"name": "lucumr.pocoo.org", "url": "https://lucumr.pocoo.org/feed.atom"},
    {"name": "skyfall.dev", "url": "https://skyfall.dev/rss.xml"},
    {"name": "garymarcus.substack.com", "url": "https://garymarcus.substack.com/feed"},
    {"name": "rachelbythebay.com", "url": "https://rachelbythebay.com/w/atom.xml"},
    {"name": "overreacted.io", "url": "https://overreacted.io/rss.xml"},
    {"name": "timsh.org", "url": "https://timsh.org/rss/"},
    {"name": "johndcook.com", "url": "https://www.johndcook.com/blog/feed/"},
    {"name": "gilesthomas.com", "url": "https://gilesthomas.com/feed/rss.xml"},
    {"name": "matklad.github.io", "url": "https://matklad.github.io/feed.xml"},
    {"name": "derekthompson.org", "url": "https://www.theatlantic.com/feed/author/derek-thompson/"},
    {"name": "evanhahn.com", "url": "https://evanhahn.com/feed.xml"},
    {"name": "terriblesoftware.org", "url": "https://terriblesoftware.org/feed/"}
  ],
  "max_entries_per_feed": 3,
  "output_file": "hotspots.html"
}

# Embedded Template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ site_title }} - {{ date }}</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #1e293b;
            --text-secondary: #64748b;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            background-color: var(--bg-color);
            color: var(--text-main);
            margin: 0;
            padding: 20px;
            padding-top: 0; 
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px 0;
            border-bottom: 2px solid #e2e8f0;
        }
        h1 {
            color: var(--primary-color);
            margin: 0;
            font-size: 2.5em;
        }
        .date {
            color: var(--text-secondary);
            margin-top: 10px;
        }
        .feed-group {
            margin-bottom: 30px;
        }
        .feed-source {
            font-size: 1.2em;
            color: var(--primary-color);
            margin-bottom: 15px;
            border-left: 4px solid var(--primary-color);
            padding-left: 10px;
            display: flex;
            align-items: center;
        }
        .article-card {
            background: var(--card-bg);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        .article-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .article-title {
            margin: 0 0 10px 0;
            font-size: 1.2em;
        }
        .article-title a {
            color: var(--text-main);
            text-decoration: none;
        }
        .article-title a:hover {
            color: var(--primary-color);
        }
        .article-meta {
            font-size: 0.9em;
            color: var(--text-secondary);
            margin-bottom: 10px;
        }
        .article-summary {
            color: #475569;
            font-size: 0.95em;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            color: var(--text-secondary);
            font-size: 0.9em;
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            h1 { font-size: 1.8em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{{ site_title }}</h1>
            <div class="date">{{ date }}</div>
        </header>

        <div id="content">
            {% if feeds_data %}
                {% for feed_name, entries in feeds_data.items() %}
                <div class="feed-group">
                    <div class="feed-source">{{ feed_name }}</div>
                    {% for entry in entries %}
                    <div class="article-card">
                        <h2 class="article-title">
                            <a href="{{ entry.link }}" target="_blank">{{ entry.title }}</a>
                        </h2>
                        <div class="article-meta">
                            <span>{{ entry.published_parsed | default(entry.updated_parsed, true) | date_format }}</span>
                        </div>
                        <div class="article-summary">
                            {{ entry.summary | striptags | truncate(200) }}
                        </div>
                    </div>
                    {% endfor %}
                </div>
                {% endfor %}
            {% else %}
                <p style="text-align: center">暂时没有获取到内容，请检查配置或网络连接。</p>
            {% endif %}
        </div>

        <div class="footer">
            <p>由 YaohuiGrowth 引擎生成于 {{ update_time }}</p>
        </div>
    </div>
</body>
</html>
"""

def load_config():
    # Try to load config.json from the same directory as the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, 'config.json')
    
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading config.json: {e}. Using default config.")
    return DEFAULT_CONFIG

def fetch_feed(url, max_entries):
    print(f"Fetching {url}...")
    try:
        feed = feedparser.parse(url)
        if feed.bozo:
            print(f"Warning: Issue parsing {url}: {feed.bozo_exception}")
        return feed.entries[:max_entries]
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

def format_date(date_struct):
    if not date_struct:
        return ""
    try:
        dt = datetime.fromtimestamp(time.mktime(date_struct))
        return dt.strftime('%Y-%m-%d %H:%M')
    except:
        return ""

def main():
    # 1. Load Config
    config = load_config()
    
    # 2. Fetch Feeds
    feeds_data = {}
    print("Starting feed fetch...")
    for feed_config in config.get('feeds', []):
        if 'example.com' in feed_config['url']:
            continue
            
        entries = fetch_feed(feed_config['url'], config.get('max_entries_per_feed', 5))
        if entries:
            feeds_data[feed_config['name']] = entries
    
    # 3. Setup Template
    from jinja2 import Environment, BaseLoader
    
    # Create an environment from the string
    env = Environment(loader=BaseLoader())
    env.filters['date_format'] = format_date
    # Load template from string
    template = env.from_string(HTML_TEMPLATE)

    # 4. Render Template
    now = datetime.now()
    html_content = template.render(
        site_title=config.get('site_title', '每日热点聚合'),
        date=now.strftime('%Y年%m月%d日'),
        update_time=now.strftime('%H:%M:%S'),
        feeds_data=feeds_data
    )

    # 5. Write Output
    # Output to public/hotspots.html relative to the script location
    # Script is in scripts/hotspots/, so public/ is at ../../public/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    output_dir = os.path.join(project_root, 'public')
    output_file = os.path.join(output_dir, 'hotspots.html')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Successfully generated {output_file}")

if __name__ == "__main__":
    main()
