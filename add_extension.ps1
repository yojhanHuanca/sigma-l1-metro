$lines = Get-Content 'c:\Users\USER\tempo\workspaces\welcome-airbnb-demo\1-meet-tempo\src\pages\jefe\JefeHome.tsx'
$insert = @"

          {/* Solicitud de ampliacion */}
          {accepted && !isVerification && (
            <div className=""p-5 border-t border-line-soft"">
              {c.actionPlan?.extensionRequest && !c.actionPlan.extensionRequest.decision ? (
                <Card className=""border-warning/30 bg-warning-soft"">
                  <div className=""p-4"">
                    <div className=""flex items-start gap-3"">
                      <div className=""h-9 w-9 rounded-lg bg-warning text-white grid place-items-center shrink-0""><Timer className=""h-4.5 w-4.5"" /></div>
                      <div className=""flex-1"">
                        <p className=""text-[13px] font-bold text-ink"">Solicitud de ampliacion enviada</p>
                        <p className=""text-[11px] text-ink-soft mt-1"">
                          Solicitada el {formatDate(c.actionPlan.extensionRequest.requestedAt)}. Nueva fecha propuesta: {formatDate(c.actionPlan.extensionRequest.nuevaFecha)}.
                        </p>
                        <p className=""text-[10px] text-ink-quiet mt-1"">Motivo: {c.actionPlan.extensionRequest.motivo}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className=""border-info/30 bg-info-soft"">
                  <div className=""p-4"">
                    <div className=""flex items-start gap-3"">
                      <div className=""h-9 w-9 rounded-lg bg-info text-white grid place-items-center shrink-0""><Timer className=""h-4.5 w-4.5"" /></div>
                      <div className=""flex-1"">
                        <p className=""text-[13px] font-bold text-ink"">Solicitar ampliacion de plazo</p>
                        <p className=""text-[11px] text-ink-soft mt-1"">Si necesita mas tiempo para completar las actividades de este plan de accion, solicite una ampliacion de plazo.</p>
                      </div>
                    </div>
                    <Button size=""sm"" variant=""outline"" className=""w-full mt-3"" onClick={() => setExtOpen(true)}>
                      <Timer className=""h-4 w-4"" /> Solicitar Ampliacion
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
"@
$newLines = $lines[0..645] + $insert + $lines[646..($lines.Length-1)]
Set-Content 'c:\Users\USER\tempo\workspaces\welcome-airbnb-demo\1-meet-tempo\src\pages\jefe\JefeHome.tsx' -Value $newLines
