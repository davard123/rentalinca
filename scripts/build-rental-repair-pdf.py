from pathlib import Path
from io import BytesIO
import json, fitz
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
# Dependencies: PyMuPDF (fitz) and ReportLab.
# Example: uv run --with pymupdf --with reportlab python scripts/build-rental-repair-pdf.py
REPO_ROOT=Path(__file__).resolve().parents[1]
OUTPUT=REPO_ROOT/'assets'/'downloads'/'rental-prelisting-repair-checklist-zh.pdf'
OUTPUT.parent.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('CJK',BytesIO(fitz.Font('cjk').buffer)))
W,H=612,792; M=35; RIGHT=W-M; CW=W-2*M
INK=HexColor('#19392d'); MUTED=HexColor('#506c5c'); BORDER=HexColor('#b9ccbf'); PALE=HexColor('#edf4ee'); AMBER=HexColor('#fff4df')
c=canvas.Canvas(str(OUTPUT),pagesize=(W,H))
c.setTitle('出租前维修准备表与报价对照 | RentalInCA');c.setAuthor('RentalInCA');c.setSubject('2026-10-18 v2 content revision')
STYLES={}
def para(txt,x,y,w,fs=8.7,leading=None,color=INK):
 st=ParagraphStyle('x',fontName='CJK',fontSize=fs,leading=leading or fs*1.55,textColor=color,wordWrap='CJK',spaceAfter=0)
 p=Paragraph(txt,st);ww,hh=p.wrap(w,1000);p.drawOn(c,x,y-hh);return y-hh

def rect(x,y,w,h,fill=white,stroke=BORDER,r=0):
 c.setFillColor(fill);c.setStrokeColor(stroke);c.setLineWidth(.6)
 if r:c.roundRect(x,y-h,w,h,r,fill=1,stroke=1)
 else:c.rect(x,y-h,w,h,fill=1,stroke=1)

def box(x,y):
 c.setStrokeColor(MUTED);c.setLineWidth(.7);c.rect(x,y-6,6,6,fill=0,stroke=1)

def label_line(label,x,y,w,fs=8):
 lw=pdfmetrics.stringWidth(label,'CJK',fs)+8
 para(label,x,y,w,fs=fs)
 c.setStrokeColor(BORDER);c.line(x+lw,y-9,x+w,y-9)
 return y-20

def header(kicker,title,page):
 para('RentalInCA · 房东工作表',M,H-30,350,10)
 para(' ',RIGHT-82,H-29,78,8)
 para(kicker,M,H-63,CW,9.3,color=MUTED)
 para(title,M,H-83,CW,21,29)
 c.setStrokeColor(BORDER);c.line(M,32,RIGHT,32)
 para('rentalinca.com · 工作安排与询价准备 · 非合同或房屋合格证明',M,26,CW-40,6.6,color=MUTED)
 para(f'{page} / 2',RIGHT-27,26,27,7,color=MUTED)
 return H-120

def heading(txt,y):return para(txt,M,y,CW,11.7,17)-7

def grid_row(cells,widths,y,height,header=False,fs=8):
 x=M
 for text,w in zip(cells,widths):
  rect(x,y,w,height,PALE if header else white)
  if text:para(text,x+7,y-6,w-14,fs,fs*1.5)
  x+=w
 return y-height

metrics=[]
y=header('01 / 先把范围说清楚','出租前维修准备表',1)
y=para('用于整理现场问题、询价范围与下一步负责人。先填本页，再把同一份范围交给报价人。空白表可自行留存，不必提供住户资料。',M,y,CW,8.8)-10
rect(M,y,CW,53,AMBER)
para('安全与必要修复优先：安全、居住条件及依法应修复事项不能作为可选升级推迟。情况不明先请合适专业人员评估；紧急危险立即按当地应急指引处理。本表不能判定房屋是否可出租，也不是施工授权或合同。',M+10,y-8,CW-20,8.3,13)
y-=64
y=label_line('物业代号 / 城市',M,y,300);label_line('记录日期',M+324,y+20,218)
y=label_line('工作联络人',M,y,300);label_line('下次核对日期',M+324,y+20,218)
y-=4;y=heading('一、先辨别项目状态',y)
cards=[('先专业评估','原因、范围或适用要求不清。写明评估人和回复时间，不用外观处理覆盖问题。'),('已明确的维修','确认范围、安排和负责人。必要修复优先；常规比价不能拖延紧急处置。'),('可选外观升级','确认不涉及安全、居住条件或其他应履行义务后，再评估范围和预算。')]
cw=(CW-18)/3
for i,(t,d) in enumerate(cards):
 x=M+i*(cw+9);rect(x,y,cw,65,white,r=6);box(x+9,y-11);para(t,x+22,y-8,cw-30,9);para(d,x+9,y-28,cw-18,8,12)
y-=78;y=heading('二、列出三项最需要推进的工作',y)
widths=[190,168,184]
y=grid_row(['位置 / 现象 / 照片编号','当前状态与下一步','负责人 / 回复日期'],widths,y,24,True)
for i in range(3):y=grid_row([str(i+1)+'.','',''],widths,y,27)
y-=13;y=heading('三、选一项，给所有报价人同一份范围',y)
fields=['项目代号 / 位置','数量、面积 / 待核实项','材料 / 型号 / 规格','包含与不包含的工作','可核对的完成结果','预计开始 / 完成时间','变更确认人 / 留档位置']
rect(M,y,CW,147,white,r=6)
y-=10
for f in fields:y=label_line(f,M+12,y,CW-24,8)
y-=4
y=para('如有现住户，进入和施工安排另行核对。可能涉及许可、专业检查或特殊材料处理时，先向适当的专业人员或主管部门确认；本页未列出全部义务。',M,y,CW,7.4,11.3,color=MUTED)
metrics.append({'page':1,'lowest_content_y':y,'footer_clear':y>38})
c.showPage()
y=header('02 / 同口径比价，完工有记录','报价对照与收尾记录',2)
y=para('CSLB 建议按相同计划、规格与范围取得至少三份书面报价。不要只看最低总价；“待定”不能填成零。紧急处置不应为了收齐报价而延误。',M,y,CW,8.8)-10
y=label_line('对应项目代号',M,y,250);label_line('范围版本 / 日期',M+270,y+20,CW-270)
widths=[145,(CW-145)/3,(CW-145)/3,(CW-145)/3]
y=grid_row(['逐栏核对','报价 A','报价 B','报价 C'],widths,y,25,True,8.4)
rows=[('报价单位 / 日期',''),('含税费等总额 / 待定项','人工、材料、清运等是否包含'),('同一范围 / 排除项','范围不同先补齐后再比'),('材料 / 规格','替代材料由谁确认'),('工期 / 可开工日期','预计日期，不当作保证'),('追加工作 / 变更方式','条件、报价与批准人'),('资料核对 / 核对日期','适用执照、保险等另核'),('付款 / 保修等条件','另行审阅正式书面条款')]
for a,b in rows:y=grid_row([a+('<br/><font color="#506c5c">'+b+'</font>' if b else ''),'','',''],widths,y,35.5,False,7.7)
y-=12;y=label_line('尚缺资料 / 报价不足三份的原因',M,y,CW,7.7)
y=label_line('拟选方案与理由 / 仍未确认的风险',M,y,CW,7.7)
y=para('以上只是比较记录，不构成接受报价、授权施工或签约。执照与保险查询记录不等于施工质量保证。',M,y,CW,7.3,11.2,color=MUTED)-11
rect(M,y,CW,108,PALE,r=6)
para('完工后逐项核对',M+11,y-9,CW-22,11.5)
checks=['对照范围与已确认的变更核对结果','前后照片及日期已对应到项目','未完事项已写负责人和回复日期','账单、产品及适用保修资料已留存','需专业检查的项目已另行确认','拍照 / 带看 / 可入住时间已重新核对']
for i,t in enumerate(checks):
 x=M+12+(i%2)*266; yy=y-34-(i//2)*18;box(x,yy-2);para(t,x+12,yy,250,7.8,11)
label_line('未完事项 / 负责人 / 日期',M+12,y-88,CW-24,7.6)
y-=119
y=para('照片不能代替现场或专业检查。具体义务、合同与施工方案需按项目另行确认；本表不提供出租时间、租金或维修回报保证。填好的表请自行妥善保管。',M,y,CW,7.3,11.2,color=MUTED)-6
url1='https://www.cslb.ca.gov/consumers/hire_a_contractor/finding_the_right_contractor.aspx';url2='https://www.cslb.ca.gov/Consumers/Hire_A_Contractor/Contracts_and_Binding_Agreements.aspx'
y=para(f'参考：<link href="{url1}" color="#28573f">CSLB 选承包商与比价建议</link>；<link href="{url2}" color="#28573f">CSLB 合同说明</link>。<br/>另参考：<link href="https://www.dre.ca.gov/publications/ResourceGuidebook/2026_Landlord_Tenant_Guide.pdf#page=58" color="#28573f">DRE California Tenants 2026版，印刷第52页起</link>。纸质：dre.ca.gov → Publications → California Tenants。<br/>资料核对：2026年10月17日（美国太平洋时间）；UTC 2026-10-18。',M,y,CW,6.8,10.3,color=MUTED)
metrics.append({'page':2,'lowest_content_y':y,'footer_clear':y>38})
c.save()
print(json.dumps(metrics,ensure_ascii=False,indent=2));assert all(x['footer_clear'] for x in metrics)
