                {(selectedField.type === 'dropdown' || selectedField.type === 'radio') && (
                  <div>
                    <Label>Options (one per line)</Label>
                    <Textarea
                      value={selectedField.options.join('\n')}
                      onChange={(e) => updateField(selectedField.id, { 
                        options: e.target.value.split('\n').filter(opt => opt.trim()) 
                      })}
                      placeholder={`Option 1
Option 2
Option 3`}
                      className="bg-gray-800 border-gray-600 text-gray-200"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedField.required}
                    onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  />
                  <Label htmlFor="required">Required</Label>
                </div>