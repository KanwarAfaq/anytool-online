import { BarcodeGenerator, BoxShadowGenerator, ExifViewer, FaviconGenerator, GradientGenerator, ImageWatermark } from './Wave2MediaTools'
import { CronGenerator, CsvConverter, JsonToTypes, SqlFormatterTool, YamlJsonTool } from './Wave2DevTools'
import { Pomodoro, TypingTest, WorldClock } from './Wave2ProductivityTools'

const components={
 'csv-converter':CsvConverter,
 'yaml-json-converter':YamlJsonTool,
 'json-to-types':JsonToTypes,
 'sql-formatter':SqlFormatterTool,
 'cron-generator':CronGenerator,
 'favicon-generator':FaviconGenerator,
 'gradient-generator':GradientGenerator,
 'box-shadow-generator':BoxShadowGenerator,
 'exif-viewer':ExifViewer,
 'image-watermark':ImageWatermark,
 'barcode-generator':BarcodeGenerator,
 'pomodoro-timer':Pomodoro,
 'world-clock':WorldClock,
 'typing-test':TypingTest,
}

export const wave2ToolSlugs=new Set(Object.keys(components))
export default function Wave2ToolSuite({slug}){const Component=components[slug];return Component?<Component/>:null}
