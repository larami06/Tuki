using Microsoft.AspNetCore.Mvc;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;

namespace TUKI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LicoesController : ControllerBase
{
    private readonly ILicaoService _service;

    public LicoesController(ILicaoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LicaoResponseDto>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<LicaoResponseDto>> GetById(int id)
    {
        var licao = await _service.GetByIdAsync(id);
        if (licao == null) return NotFound();
        return Ok(licao);
    }

    [HttpGet("idade/{idade}")]
    public async Task<ActionResult<IEnumerable<LicaoResponseDto>>> GetByIdade(int idade)
        => Ok(await _service.GetByIdadeAsync(idade));

    [HttpPost]
    public async Task<ActionResult<LicaoResponseDto>> Create(LicaoCreateDto dto)
    {
        var result = await _service.AddAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, LicaoCreateDto dto)
    {
        try
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
