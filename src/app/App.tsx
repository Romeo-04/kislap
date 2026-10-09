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

export function App() {
  const route = useRoute()
  return (
    <I18nProvider>
      <main className="screen">
        {route.name === 'home' && <Home />}
        {route.name === 'map' && <StoryMap />}
        {route.name === 'reading' && <Reading storyId={route.storyId} />}
        {route.name === 'result' && <Result storyId={route.storyId} />}
        {route.name === 'wordpop' && <WordPop />}
        {route.name === 'progress' && <Progress />}
        {route.name === 'miccheck' && <MicCheck />}
        {route.name === 'mictest' && <MicTest />}
      </main>
    </I18nProvider>
  )
}
