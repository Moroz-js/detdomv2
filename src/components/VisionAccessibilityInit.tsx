import { visionInitScript } from '@/lib/visionAccessibility'

export function VisionAccessibilityInit() {
  return <script dangerouslySetInnerHTML={{ __html: visionInitScript }} />
}
