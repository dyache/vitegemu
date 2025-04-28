from typing import List
from bs4 import BeautifulSoup
from pydantic import BaseModel
import requests
from datetime import datetime, timedelta
import re





def get_upcoming_cs2_matches():
    url = "https://liquipedia.net/counterstrike/Liquipedia:Matches"
    response = requests.get(url)
    html_content = response.text

    soup = BeautifulSoup(html_content, 'html.parser')
    div_content = soup.find('div', {'data-toggle-area-content': '2'})
    
    matches = []

    if div_content:
        tables = div_content.find_all('table', class_='wikitable wikitable-striped infobox_matches_content')
        
        for table in tables:
            rows = table.find_all('tr')
            for i in range(len(rows) - 1):
                row = rows[i]
                next_row = rows[i + 1]

                team_left_name = team_right_name = league_name = None

                # Команды
                left_team_span = row.find('td', class_='team-left')
                right_team_span = row.find('td', class_='team-right')
                if left_team_span and right_team_span:
                    left_team_text = left_team_span.find('span', class_='team-template-text')
                    right_team_text = right_team_span.find('span', class_='team-template-text')
                    if left_team_text and right_team_text:
                        team_left_name = left_team_text.get_text(strip=True)
                        team_right_name = right_team_text.get_text(strip=True)

                # Следующий ряд должен содержать match info
                match_details_cell = next_row.find('td', class_='match-filler')
                if match_details_cell:
                    countdown_span = match_details_cell.find('span', class_='timer-object-countdown-only')
                    if countdown_span and countdown_span.get('data-timestamp'):
                        timestamp = countdown_span['data-timestamp']
                        dt_object = datetime.fromtimestamp(int(timestamp))

                        # --- Removed today/tomorrow filter ---

                        # Лига
                        league_tag = match_details_cell.find('div', class_='text-nowrap')
                        if league_tag and league_tag.a:
                            league_name = league_tag.a.get_text(strip=True)

                        # Поток
                        twitch_stream_link = countdown_span.get('data-stream-twitch')
                        if not twitch_stream_link:
                            twitch_tag = match_details_cell.find('a', href=re.compile(r"/counterstrike/Special:Stream/twitch/"))
                            if twitch_tag:
                                twitch_stream_link = twitch_tag['href'].split('/')[-1]

                        match_info = {
                            'team_left': team_left_name,
                            'team_right': team_right_name,
                            'league': league_name,
                            'datetime': dt_object,
                            'timestamp': timestamp,
                            'stream_link': f"https://liquipedia.net/counterstrike/Special:Stream/twitch/{twitch_stream_link}" if twitch_stream_link else None
                        }

                        matches.append(match_info)
    return matches
