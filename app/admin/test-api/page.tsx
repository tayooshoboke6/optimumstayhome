export default function TestApiPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Testing Guide</h1>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Block Dates API</h2>
          <p className="mb-4">Use Postman to test the Block Dates API with the following configuration:</p>

          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-mono">POST /api/admin/block-dates</p>
          </div>

          <h3 className="font-semibold mt-4 mb-2">Request Body (JSON):</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {`{
  "startDate": "2023-12-24T00:00:00.000Z",
  "endDate": "2023-12-26T00:00:00.000Z",
  "reason": "Christmas Holiday"
}`}
          </pre>

          <h3 className="font-semibold mt-4 mb-2">Expected Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {`{
  "success": true,
  "message": "Dates blocked successfully",
  "id": "generated-document-id"
}`}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">List Blocked Dates API</h2>
          <p className="mb-4">Use Postman to test the List Blocked Dates API:</p>

          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-mono">GET /api/admin/block-dates/list</p>
          </div>

          <h3 className="font-semibold mt-4 mb-2">Expected Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {`{
  "success": true,
  "count": 1,
  "dates": [
    {
      "id": "document-id",
      "startDate": "2023-12-24T00:00:00.000Z",
      "endDate": "2023-12-26T00:00:00.000Z",
      "reason": "Christmas Holiday",
      "createdAt": "2023-12-01T12:00:00.000Z"
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
