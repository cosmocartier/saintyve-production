"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SIZE_GUIDE } from "@/lib/size-guide/size-guide-data"

export function SizeGuideContent() {
  return (
    <section className="pb-20 px-6 lg:px-12" id="category-tabs">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="sneakers" className="w-full">
          {/* Category Tabs */}
          <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent h-auto p-0 mb-12 flex-wrap">
            <TabsTrigger
              value="sneakers"
              className="text-[11px] font-mono uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent px-4 py-3"
            >
              Sneakers
            </TabsTrigger>
            <TabsTrigger
              value="jackets"
              className="text-[11px] font-mono uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent px-4 py-3"
            >
              Jackets
            </TabsTrigger>
            <TabsTrigger
              value="vests"
              className="text-[11px] font-mono uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent px-4 py-3"
            >
              Vests
            </TabsTrigger>
            <TabsTrigger
              value="watches"
              className="text-[11px] font-mono uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent px-4 py-3"
            >
              Watches
            </TabsTrigger>
            <TabsTrigger
              value="jewelry"
              className="text-[11px] font-mono uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent px-4 py-3"
            >
              Jewelry
            </TabsTrigger>
            <TabsTrigger
              value="bags"
              className="text-[11px] font-mono uppercase tracking-[0.15em] data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent px-4 py-3"
            >
              Bags
            </TabsTrigger>
          </TabsList>

          {/* Sneakers Content */}
          <TabsContent value="sneakers" className="space-y-8">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-6">
                Size Conversion Table
              </h3>
              <div className="border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">EU</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">US (Men)</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">UK</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">CM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SIZE_GUIDE.sneakers.conversionTable.map((row) => (
                      <TableRow key={row.eu}>
                        <TableCell className="text-[13px] font-mono">{row.eu}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.usM}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.uk}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.cm}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">Fit Notes</h3>
              <ul className="space-y-2">
                {SIZE_GUIDE.sneakers.fitNotes.map((note, i) => (
                  <li key={i} className="text-[13px] font-mono text-gray-700">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Jackets Content */}
          <TabsContent value="jackets" className="space-y-8">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-6">
                Measurements Table (CM)
              </h3>
              <div className="border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">Size</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">Chest (cm)</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">Shoulder (cm)</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">Sleeve (cm)</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">Length (cm)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SIZE_GUIDE.jackets.measurementsTable.map((row) => (
                      <TableRow key={row.size}>
                        <TableCell className="text-[13px] font-mono font-medium">{row.size}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.chest}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.shoulder}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.sleeve}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">How to Measure</h3>
              <ul className="space-y-2">
                {SIZE_GUIDE.jackets.howToMeasure.map((step, i) => (
                  <li key={i} className="text-[13px] font-mono text-gray-700">
                    • {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">Fit Notes</h3>
              <ul className="space-y-2">
                {SIZE_GUIDE.jackets.fitNotes.map((note, i) => (
                  <li key={i} className="text-[13px] font-mono text-gray-700">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Vests Content */}
          <TabsContent value="vests" className="space-y-8">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-6">
                Measurements Table (CM)
              </h3>
              <div className="border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">Size</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">Chest (cm)</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">Length (cm)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SIZE_GUIDE.vests.measurementsTable.map((row) => (
                      <TableRow key={row.size}>
                        <TableCell className="text-[13px] font-mono font-medium">{row.size}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.chest}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">Fit Notes</h3>
              <ul className="space-y-2">
                {SIZE_GUIDE.vests.fitNotes.map((note, i) => (
                  <li key={i} className="text-[13px] font-mono text-gray-700">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Watches Content */}
          <TabsContent value="watches">
            <div className="bg-gray-50 border border-gray-100 p-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">
                Understanding Watch Sizing
              </h3>
              <ul className="space-y-2">
                {SIZE_GUIDE.watches.notes.map((note, i) => (
                  <li key={i} className="text-[13px] font-mono text-gray-700">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Jewelry Content */}
          <TabsContent value="jewelry" className="space-y-10">
            {/* Rings Section */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black">Ring Size Guide</h3>
              <div className="border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">US Size</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">EU Size</TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">
                        Inner Diameter (mm)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SIZE_GUIDE.jewelry.rings.table.map((row) => (
                      <TableRow key={row.us}>
                        <TableCell className="text-[13px] font-mono">{row.us}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.eu}</TableCell>
                        <TableCell className="text-[13px] font-mono">{row.diameter}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-6">
                <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">
                  How to Measure Your Ring Size
                </h4>
                <ul className="space-y-2">
                  {SIZE_GUIDE.jewelry.rings.howToMeasure.map((step, i) => (
                    <li key={i} className="text-[13px] font-mono text-gray-700">
                      {i + 1}. {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bracelets Section */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black">Bracelet Size Guide</h3>
              <div className="border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">
                        Wrist Circumference (cm)
                      </TableHead>
                      <TableHead className="text-[11px] font-mono uppercase tracking-[0.1em]">
                        Recommended Size
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SIZE_GUIDE.jewelry.bracelets.table.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-[13px] font-mono">{row.wristCircumference}</TableCell>
                        <TableCell className="text-[13px] font-mono font-medium">{row.recommendedSize}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-6">
                <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">
                  How to Measure Your Bracelet Size
                </h4>
                <ul className="space-y-2">
                  {SIZE_GUIDE.jewelry.bracelets.howToMeasure.map((step, i) => (
                    <li key={i} className="text-[13px] font-mono text-gray-700">
                      {i + 1}. {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Bags Content */}
          <TabsContent value="bags">
            <div className="bg-gray-50 border border-gray-100 p-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">
                Understanding Bag Dimensions
              </h3>
              <ul className="space-y-2">
                {SIZE_GUIDE.bags.notes.map((note, i) => (
                  <li key={i} className="text-[13px] font-mono text-gray-700">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
