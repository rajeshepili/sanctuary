import { getExportData } from './journal.export'
import { parseCommaList } from '#/utils/string'
import { toast } from 'sonner'

export async function runHumanReadableExport() {
  if (!window.sanctuary) {
    toast.error('Export only available on desktop.')
    return
  }

  const toastId = toast.loading('Preparing archive...')

  try {
    const data = await getExportData()
    const basePath = await window.sanctuary.selectDirectory()

    if (!basePath) {
      toast.dismiss(toastId)
      return
    }

    toast.loading('Writing files...', { id: toastId })

    const files: Array<{ path: string; content: string }> = []

    // 1. Entries as Markdown
    for (const entry of data.entries) {
      const date = new Date(entry.createdAt)
      const dateStr = date.toISOString().split('T')[0]
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-')
      const fileName = `entries/${dateStr}_${timeStr}_${entry.id}.md`

      const parsedTags = parseCommaList(entry.tags)
      const tags = parsedTags.length > 0 ? parsedTags.map((t) => `"${t}"`).join(', ') : ''

      const frontmatter = [
        '---',
        `date: "${date.toISOString()}"`,
        tags ? `tags: [${tags}]` : 'tags: []',
        `pinned: ${entry.isPinned}`,
        '---',
        '',
      ].join('\n')

      let content = frontmatter + entry.content

      if (entry.media.length > 0) {
        content += '\n\n---\n\n## Media\n\n'
        for (const m of entry.media) {
          const mediaFileName = m.filePath.split('/').pop()
          content += `![Memory](../media/${mediaFileName})\n`
        }
      }

      files.push({ path: fileName, content })
    }

    // 2. Habits as Markdown
    let habitMd = '# Habit Consistency Report\n\n'
    habitMd += `Exported on: ${new Date().toLocaleString()}\n\n`

    for (const habit of data.habits) {
      habitMd += `## ${habit.name}\n`
      habitMd += `- Category: ${habit.category}\n`
      habitMd += `- Frequency: ${habit.frequency}\n`
      habitMd += `- Total Completions: ${habit.completions.length}\n\n`
      
      if (habit.completions.length > 0) {
        habitMd += '### Recent Completions\n'
        const recent = habit.completions.slice(0, 20)
        for (const c of recent) {
          habitMd += `- ${c.completedAt} (${c.tier})\n`
        }
        habitMd += '\n'
      }
    }
    files.push({ path: 'habits_report.md', content: habitMd })

    // 3. Simple Index HTML
    const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Sanctuary Archive</title>
  <style>
    body { font-family: system-ui; line-height: 1.5; max-width: 800px; margin: 2rem auto; padding: 0 1rem; background: #fafafa; color: #1a1a1a; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 1rem; }
    .meta { font-size: 0.8rem; color: #666; margin-bottom: 1rem; }
    a { color: #6366f1; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Sanctuary Archive</h1>
  <p class="meta">Exported at: ${new Date().toLocaleString()}</p>
  
  <div class="card">
    <h2>Journal Entries</h2>
    <p>Total: ${data.entries.length} entries</p>
    <p>Stored as individual Markdown files in the <code>entries/</code> folder.</p>
  </div>

  <div class="card">
    <h2>Habits</h2>
    <p>Total: ${data.habits.length} habits tracked</p>
    <p><a href="habits_report.md">View Habits Report</a></p>
  </div>

  <div class="card">
    <h2>Raw Data</h2>
    <p><a href="data.json">View data.json</a> (Machine-readable backup)</p>
  </div>
</body>
</html>`
    files.push({ path: 'index.html', content: indexHtml })

    // 4. Raw JSON backup
    files.push({ path: 'data.json', content: JSON.stringify(data, null, 2) })

    // Execute the write
    await window.sanctuary.writeFileStructure(basePath, files)

    toast.success('Archive exported successfully!', { id: toastId })
  } catch (error) {
    console.error('Export failed:', error)
    toast.error('Failed to generate archive.', { id: toastId })
  }
}
