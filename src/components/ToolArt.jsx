export default function ToolArt({tool,name,hero=false}){
  const label=name||tool.name
  return <div className={hero?'tool-art tool-art-hero':'tool-art'}>
    <img src={'/tool-art/'+tool.slug+'.svg'} alt={label+' visual preview'} width="640" height="360" loading={hero?'eager':'lazy'} decoding="async" fetchPriority={hero?'high':'auto'}/>
  </div>
}
