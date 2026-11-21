// Express knows this is the error handler because it has 4 arguments
export default function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }

  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}