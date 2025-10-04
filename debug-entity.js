// Add this endpoint to debug connection details
router.get('/debug-entity', async (req, res) => {
  try {
    const { connectedAccountId } = req.query;
    
    if (!connectedAccountId) {
      return res.status(400).json({ error: 'connectedAccountId is required' });
    }

    // Get the connection details
    const connections = await composio.connectedAccounts.list();
    const connection = connections.items.find((conn: any) => conn.id === connectedAccountId);
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Try to find the entity ID used for this connection
    // Let's check if we can get entities and see which one has this connection
    const entities = await composio.entities.list();
    console.log('Available entities:', entities);

    // Also log the connection details to see if entity ID is stored anywhere
    console.log('Connection details:', JSON.stringify(connection, null, 2));

    return res.json({
      connection: connection,
      entities: entities,
      message: 'Check console logs for detailed entity information'
    });
  } catch (error) {
    console.error('Debug entity error:', error);
    return res.status(500).json({ error: 'Failed to debug entity information' });
  }
});