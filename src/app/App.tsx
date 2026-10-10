import { I18nProvider } from '../i18n'
import { useRoute } from './router'
import { Home } from './Home'
import { StoryMap } from './StoryMap'
import { Reading } from './Reading'
import { Result } from './Result'
import { WordPop } from './WordPop'
import { Progress } from './Progress'
import { MicCheck } from './MicCheck'
import { MicTest } from './MicTest'
import { AsrTest } from './AsrTest'
import { Bench } from './Bench'
import { Golden } from './Golden'
import { GameShell } from '../ui/GameShell'
import { Settings } from './Settings'
import { MyStory } from './MyStory'

export function App() {
  const route = useRoute()
  return (
    <I18nProvider>
      <GameShell route={route.name}>
        {route.name === 'home' && <Home />}
        {route.name === 'map' && <StoryMap />}
        {route.name === 'reading' && <Reading key={route.storyId} storyId={route.storyId} />}
        {route.name === 'result' && <Result key={route.storyId} storyId={route.storyId} />}
        {route.name === 'wordpop' && <WordPop />}
        {route.name === 'progress' && <Progress />}
        {route.name === 'miccheck' && <MicCheck />}
        {route.name === 'settings' && <Settings />}
        {route.name === 'mystory' && <MyStory />}
        {route.name === 'mictest' && <MicTest />}
        {route.name === 'asrtest' && <AsrTest />}
        {route.name === 'bench' && <Bench />}
        {route.name === 'golden' && <Golden />}
      </GameShell>
    </I18nProvider>
  )
}
